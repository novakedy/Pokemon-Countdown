# Pokemon Countdown

## Initial Project Setup

After Xcode 11 is installed and has been opened at least once, do the following.

1. Install nvm

    ```sh
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
    ```

2. Copy the following text:

    ```
    export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
    ```

3. Add the copied text to your base profile

    ```sh
    pbpaste >> ~/.bash_profile
    ```

4. Resource the bash profile into the current shell session.

    ```sh
    . ~/.bash_profile
    ```

5. Use nvm to install the correct version of Node.

    ```sh
    nvm install 10.16.3
    ```

6. Set the default Node version on nv,

    ```sh
    nvm alias default 10.16.3
    ```

7. Install Bundler

    ```sh
    gem install bundler
    ```

8. Install all project dependencies
    ```sh
    yarn && bundle install
    ```

## Updating / Installing Dependencies

```sh
yarn
```

## Running the Project

```sh
yarn run ios
```

or

```sh
yarn run android
```

## Adding a Dependency

```sh
yarn add dependency-name
```
