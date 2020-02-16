package shared_test

import (
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"

	"github.com/scribletop/scribletop-api/shared"
)

var _ = Describe("Shared.TagGenerator", func() {
	var tg shared.TagGenerator
	BeforeEach(func() { tg = shared.NewTagGenerator() })

	Context("Random", func() {
		It("should generate a random tag", func() {
			Expect(tg.Random(1)).To(MatchRegexp("[0-9]{1}"))
			Expect(tg.Random(2)).To(MatchRegexp("[0-9]{2}"))
			Expect(tg.Random(3)).To(MatchRegexp("[0-9]{3}"))
			Expect(tg.Random(4)).To(MatchRegexp("[0-9]{4}"))
		})
	})

	Context("RandomExcept", func() {
		It("should generate a random tag except the one given", func() {
			for i := 0; i < 10; i++ {
				Expect(tg.RandomExcept(1, []string{"1"})).NotTo(Equal(1))
			}
		})

		It("should fail when no candidates are available", func() {
			res, err := tg.RandomExcept(0, []string{"1"})
			Expect(err).To(HaveOccurred())
			Expect(res).To(BeEmpty())
		})
	})
})
