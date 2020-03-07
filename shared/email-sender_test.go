package shared_test

import (
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
	"github.com/scribletop/scribletop-api/config"
	mocks "github.com/scribletop/scribletop-api/mocks/shared"
	"github.com/scribletop/scribletop-api/shared"
	"github.com/sendgrid/sendgrid-go/helpers/mail"
	"github.com/stretchr/testify/mock"
)

var _ = Describe("Email Sender", func() {
	Context("Building", func() {
		It("Should build correctly", func() {
			c := config.LoadTest("")
			es, err := shared.NewEmailSender("test@scribletop", "http://localhost:8080", shared.NewMailtrapClient(c.Mail))
			Expect(err).NotTo(HaveOccurred())
			Expect(es).NotTo(BeNil())
		})
	})

	Context("Sending mails", func() {
		c := config.LoadTest("")
		es, _ := shared.NewEmailSender("test@scribletop", "http://localhost:8080", shared.NewMailtrapClient(c.Mail))

		It("sends a mail to mailtrap", func() {
			err := es.SendEmail("foo#1231 <foo@example.com>", "bar", "new-user", struct{ Link string }{
				Link: "http://example.com",
			})
			Expect(err).NotTo(HaveOccurred())
		})
	})

	Context("Sending mails with mock", func() {
		var m *mocks.EmailClient
		var es shared.EmailSender

		BeforeEach(func() {
			m = new(mocks.EmailClient)
			es, _ = shared.NewEmailSender("test@scribletop", "http://localhost:8080", m)
		})

		AfterEach(func() {
			m.AssertExpectations(GinkgoT())
		})

		It("fails to build with incorrect bindings", func() {
			err := es.SendEmail("foo#1231 <foo@example.com>", "bar", "new-user", struct{}{})
			Expect(err).To(HaveOccurred())
		})

		It("fails to build with nil bindings", func() {
			err := es.SendEmail("foo#1231 <foo@example.com>", "bar", "new-user", nil)
			Expect(err).To(HaveOccurred())
		})

		It("fails with unknown mail", func() {
			err := es.SendEmail("foo#1231 <foo@example.com>", "bar", "___unknown___", struct{}{})
			Expect(err).To(HaveOccurred())
		})

		It("replaces all __ROOT_URL__ in message", func() {
			m.On("Send", mock.Anything).Return(nil, nil)
			es.SendEmail("foo#1231 <foo@example.com>", "bar", "new-user", struct{ Link string }{Link: "__ROOT_URL__/__ROOT_URL__wqsax"})
			Expect(m.Calls[0].Arguments.Get(0).(*mail.SGMailV3).Content[0].Value).NotTo(ContainSubstring("__ROOT_URL__"))
			Expect(m.Calls[0].Arguments.Get(0).(*mail.SGMailV3).Content[1].Value).NotTo(ContainSubstring("__ROOT_URL__"))
			Expect(m.Calls[0].Arguments.Get(0).(*mail.SGMailV3).Content[0].Value).To(ContainSubstring("http://localhost:8080/http://localhost:8080wqsax"))
		})
	})
})
