default: watch

export HTTP_JWT_PUBLIC=$(shell cat ./secrets/public.pem | base64 -w0)
export HTTP_JWT_PRIVATE=$(shell cat ./secrets/private.pem | base64 -w0)

all: build test-with-cover

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
