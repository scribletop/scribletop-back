package users_test

import (
	"github.com/golang/mock/gomock"

	. "github.com/onsi/ginkgo"
)

var _ = Describe("Users.Repository", func() {
	//var r users.Repository
	var mockCtrl *gomock.Controller
	BeforeEach(func() {
		mockCtrl = gomock.NewController(GinkgoT())
	})

	AfterEach(func() { mockCtrl.Finish() })

})
