default: build

watch:
	air

test-watch:
	ginkgo watch -r

test:
	ginkgo -r

build:
	go build .
