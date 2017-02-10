PROJECT_DIR := $(dir $(abspath $(lastword $(MAKEFILE_LIST))))
TARGET_DIR=$(PROJECT_DIR)target

CI_BUILD_NUMBER ?= $(USER)-snapshot
CI_WORKDIR ?= $(shell pwd)
# PROJECT = ai-blt
# CLUSTER = blt-stage  # Kubernetes cluster to deploy to (managed by A&I team)
# ZONE = asia-east1-c  # ZONE for the sandbox cluster

PUBLISH_TAG_APP ?= "mup.cr/webplatform/web-platform-starter:$(CI_BUILD_NUMBER)"
PUBLISH_TAG_ASSET ?= "mup.cr/webplatform/web-platform-starter-asset:$(CI_BUILD_NUMBER)"

# PRODUCTION_DOMAIN = "meetup.computer"

# lists all available targets
list:
	@sh -c "$(MAKE) -p no_op__ | \
		awk -F':' '/^[a-zA-Z0-9][^\$$#\/\\t=]*:([^=]|$$)/ {split(\$$1,A,/ /);\
		for(i in A)print A[i]}' | \
		grep -v '__\$$' | \
		grep -v 'make\[1\]' | \
		grep -v 'Makefile' | \
		sort"

# required for list
no_op__:

# __set-prod:
# 	$(eval PROJECT=meetup-prod)
# 	$(eval CLUSTER=mup-prod)
# 	$(eval ZONE=us-east1-b)
# 	$(eval LOAD_BALANCER_IP=104.196.98.37)

__package:
	docker build \
		--build-arg COVERALLS_REPO_TOKEN=$(COVERALLS_REPO_TOKEN) \
		--build-arg TRAVIS=$(TRAVIS) \
		--build-arg TRAVIS_BRANCH=$(TRAVIS_BRANCH) \
		--build-arg TRAVIS_COMMIT=$(TRAVIS_COMMIT) \
		--build-arg TRAVIS_JOB_ID=$(TRAVIS_JOB_ID) \
		--build-arg TRAVIS_PULL_REQUEST=$(TRAVIS_PULL_REQUEST) \
		-t $(PUBLISH_TAG_APP) .
	mkdir -p build
	docker run \
		--rm \
		-u="root" \
		-v $(CI_WORKDIR)/build:/data \
		$(PUBLISH_TAG_APP) \
		cp -r build/browser-app/ /data

__package-test:
	@echo 'no component/integration/other tests'

# called by Travis and prod build
package: __package __package-asset __package-test

version:
	@echo $(CI_BUILD_NUMBER)

__package-asset:
	docker build -t $(PUBLISH_TAG_ASSET) -f Dockerfile.asset .

# run by travis / CI
# push prod env + code to registry
publish: package
	docker push $(PUBLISH_TAG_APP)
	docker push $(PUBLISH_TAG_ASSET)

__deploy-only:
	# create namespace if it doesn't exist
	# kubectl apply -f infrastructure/webplatform-ns.yaml

	# update load balancer entry point
	# LOAD_BALANCER_IP=$(LOAD_BALANCER_IP) \
		envtpl < infrastructure/mup-web-svc.yaml | kubectl apply -f -

	# update ssl proxy config
	# PRODUCTION_DOMAIN=$(PRODUCTION_DOMAIN) \
		envtpl < infrastructure/ssl-proxy-config.yaml | kubectl apply -f -

	# inject the current CI_BUILD_NUMBER into the deployment spec
	# PUBLISH_TAG_APP=$(PUBLISH_TAG_APP) \
	# PUBLISH_TAG_ASSET=$(PUBLISH_TAG_ASSET) \
		envtpl < infrastructure/mup-web-dply.yaml | kubectl apply -f -

__get-credentials:
	# @gcloud config set project $(PROJECT)
	# @gcloud container clusters get-credentials $(CLUSTER) --zone $(ZONE)

__get-creds-deploy: __get-credentials __deploy-only
deploy-prod: __set-prod __get-creds-deploy

run-local:
	docker run \
	--rm \
	-it \
	--env-file $(HOME)/.mupweb.config \
	-p $(DEV_SERVER_PORT):8000 \
	$(PUBLISH_TAG_APP)

run-local-asset:
	docker run \
	--rm \
	-it \
	-p $(ASSET_SERVER_PORT):8001 \
	$(PUBLISH_TAG_ASSET)

