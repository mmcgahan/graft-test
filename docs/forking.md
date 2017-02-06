# Forking a web platform application

One way to set up a new copy of the repo is to first clone it and then set up
a new 'remote' `origin` that you create on GitHub.

1. In GitHub, create a new, _empty_ repository.
2. On your local machine, clone the app repo into a directory with the name
of your new GitHub repo

    ```sh
    > git clone git@github.com:meetup/web-platform-starter.git my-cool-app
    > cd my-cool-app
    ```

3. set the `origin` remote url to your new GitHub repo url

    ```sh
    > git remote set-url origin git@github.com:meetup/my-cool-app.git
    ```

4. push the code to the new repo and set the upstream tracking branch

    ```sh
    > git push origin -u
    ```

5. In general, you will probably want to have the option of pulling updates
to the starter repo into your own copy - these updates might include build
improvements, dependency updates, and React application helpers. It's therefore
useful to set this repo as an additional `upstream` remote:

    ```sh
    > git remote add upstream git@github.com:meetup/meetup-web-starter.git
    ```

		To pull updates:

    ```sh
    > git pull upstream master
    ```

