package shared_test

import (
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
	"github.com/scribletop/scribletop-api/config"
	"github.com/scribletop/scribletop-api/shared"
)

var _ = Describe("Email Sender", func() {
	Context("Building", func() {
		It("Should build correctly", func() {
			c := config.LoadTest("")
			es, err := shared.NewEmailSender("test@scribletop", shared.NewMailtrapClient(c.Mail))
			Expect(err).NotTo(HaveOccurred())
			Expect(es).NotTo(BeNil())
		})
	})

	Context("Sending mails", func() {
		c := config.LoadTest("")
		es, _ := shared.NewEmailSender("test@scribletop", shared.NewMailtrapClient(c.Mail))

		It("sends a mail to mailtrap", func() {
			err := es.SendEmail("foo#1231 <foo@example.com>", "bar", "new-user", struct{ Link string }{
				Link: "http://example.com",
			})
			Expect(err).NotTo(HaveOccurred())
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
	})
})
