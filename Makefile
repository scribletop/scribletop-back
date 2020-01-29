default: build

watch:
	air

test-watch:
	ginkgo watch -r

test:
	ginkgo -r

test-with-cover:
	ginkgo -r -cover

build:
	go build .
