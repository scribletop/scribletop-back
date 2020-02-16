default: watch

export HTTP_JWT_PUBLIC=$(shell cat ./secrets/public.pem | base64 -w0)
export HTTP_JWT_PRIVATE=$(shell cat ./secrets/private.pem | base64 -w0)
export MAIL_HOST=smtp.mailtrap.io
export MAIL_PORT=25
export MAIL_USERNAME=$(shell cat ./secrets/mailtrap.username)
export MAIL_PASSWORD=$(shell cat ./secrets/mailtrap.password)

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
