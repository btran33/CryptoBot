# CryptoBot
A cryptocurrency trading bot, built on Node.js and several APIs such as Coinbase and Commander.

## Preface
This is my first attempt at creating a bot using Node.js, as well as interacting with third-party APIs. There will be a lot of documentation in each class for the readers' and my own sake. Feel free to modify the trading strategy once you understand how the backend works. \
In addition, the plan is to have the bot dockerized and hosted on my Raspberri Pi 3B+. Instructions may be included, but no guarantees.

## Get Started
1. Install Node.js on your machine if you have not already. The best option is to install [nvm (Node Version Manager)](https://github.com/nvm-sh/nvm) for different Node version when working with different projects. For this, I am using version 18, so install Node v.18 by typing in the command line: 
    ```
    nvm install 18
    nvm use 18
    ```
2. Install the dependencies, by cd-ing to root directory and type:
    ```
    npm install
    ```
3. Start the bot by typing this in command line:
    ```
    npm start
    ```
    or, for more control, type:
    ```
    node index.js --help
    ```
    to adjust how the bot will behave with command-line arguments