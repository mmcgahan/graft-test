FROM meetup/node-yarn:7.5.0-0.20.3

RUN useradd --user-group --create-home --shell /bin/false mup

ENV API_PROTOCOL=https
ENV COVERALLS_SERVICE_NAME=travis-pro
ENV NODE_PATH=/home/mup/node_modules
ENV PATH=/home/mup/node_modules/.bin/:/home/mup/.yarn/bin/:$PATH

ARG COVERALLS_REPO_TOKEN
ARG TRAVIS
ARG TRAVIS_BRANCH
ARG TRAVIS_COMMIT
ARG TRAVIS_JOB_ID
ARG TRAVIS_PULL_REQUEST=FALSE

# cache builds
# only rebuild if package.json or yarn.lock has changed
WORKDIR /home/mup/
COPY package.json yarn.lock /home/mup/

# install packages, don't generate a lockfile
USER mup
RUN yarn --pure-lockfile && yarn cache clean
EXPOSE 8000

# copy app code to container
WORKDIR /home/mup/web-platform-starter
COPY . /home/mup/web-platform-starter

# user needs to be root to change ownership
USER root
RUN chown -R mup:mup /home/mup/web-platform-starter

# switch back to mup for yarn
USER mup

# build, test, coveralls, remove dev dependencies
ENV NODE_ENV=production
RUN yarn run package

CMD ["yarn","run","start:prod"]

