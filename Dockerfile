FROM meetup/node-yarn:7.6-0.21

RUN useradd --user-group --create-home --shell /bin/false mup

ENV NODE_PATH=/home/mup/node_modules
ENV PATH=/home/mup/node_modules/.bin/:/home/mup/.yarn/bin/:$PATH

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

# need to set this after installing modules otherwise no npm-run-all
ENV NODE_ENV=production
# build & test
RUN yarn run package

CMD ["yarn","run","start:prod"]

