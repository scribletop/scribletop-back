package shared

import (
	"bytes"
	"errors"
	"fmt"
	"html/template"
	"io/ioutil"
	"net/smtp"
	"os"
	"strings"

	"jaytaylor.com/html2text"

	"github.com/markbates/pkger"
	"github.com/sendgrid/rest"
	"github.com/sendgrid/sendgrid-go/helpers/mail"

	"github.com/scribletop/scribletop-api/config"
)

type EmailSender interface {
	SendEmail(dest, subject, filename string, bindings interface{}) error
}

type EmailClient interface {
	Send(*mail.SGMailV3) (*rest.Response, error)
}

type emailSender struct {
	senderEmail string
	rootUrl     string
	client      EmailClient
}

var emails = map[string]*template.Template{}

func NewEmailSender(senderEmail string, rootUrl string, client EmailClient) (EmailSender, error) {
	return &emailSender{senderEmail, rootUrl, client},
		pkger.Walk("/emails", func(path string, info os.FileInfo, err error) error {
			if err != nil {
				return err
			}

			if info.Name() == "emails" {
				return nil
			}

			name := strings.Split(info.Name(), ".")
			res, err := readEmailFile(path)
			if err != nil {
				return err
			}

			emails[name[0]], err = template.New(name[0] + "email").Parse(string(res))
			if err != nil {
				return err
			}

			return nil
		})
}

func (es *emailSender) SendEmail(dest, subject, name string, bindings interface{}) error {
	if bindings == nil {
		return errors.New("sendemail: nil bindings are not allowed, send an empty struct")
	}
	t, ok := emails[name]
	if !ok {
		return errors.New("sendemail: template not found")
	}

	from := mail.NewEmail("Scribletop", es.senderEmail)
	d := strings.Split(dest, " ")
	to := mail.NewEmail(d[0], strings.Trim(d[1], "<>"))
	var w bytes.Buffer
	err := t.Execute(&w, bindings)
	if err != nil {
		return err
	}

	html := strings.ReplaceAll(w.String(), "__ROOT_URL__", es.rootUrl)
	txt, err := html2text.FromString(html)
	if err != nil {
		return err
	}

	message := mail.NewSingleEmail(from, subject, to, txt, html)
	_, err = es.client.Send(message)
	if err != nil {
		return err
	}

	return nil
}

func readEmailFile(path string) (html []byte, err error) {
	f, err := pkger.Open(path)
	if err != nil {
		return
	}
	defer func() {
		err = f.Close()
	}()

	return ioutil.ReadAll(f)
}

type mailtrapClient struct {
	c config.MailConfig
}

func NewMailtrapClient(c config.MailConfig) EmailClient {
	return &mailtrapClient{c}
}

func (mc *mailtrapClient) Send(m *mail.SGMailV3) (*rest.Response, error) {
	auth := smtp.PlainAuth("", mc.c.Username, mc.c.Password, mc.c.Host)
	err := smtp.SendMail(
		fmt.Sprintf("%s:%d", mc.c.Host, mc.c.Port),
		auth,
		m.From.Address,
		[]string{m.Personalizations[0].To[0].Address},
		[]byte(
			"From: "+m.From.Name+" <"+m.From.Address+">\r\n"+
				"To: "+m.Personalizations[0].To[0].Name+" <"+m.Personalizations[0].To[0].Address+">\r\n"+
				"Subject: "+m.Subject+"\r\n"+
				"Content-Type: text/html; charset=utf-8\r\n"+
				"\r\n"+
				m.Content[1].Value+"\r\n",
		),
	)

	return nil, err
}
