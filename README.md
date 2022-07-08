# CryptoBot
A cryptocurrency trading bot, built on Node.js and Coinbase API. Pre-packaged with Simple and MACD trading strategy.

![cryptobot](https://user-images.githubusercontent.com/70242197/178078472-071e1178-4f72-463e-9331-b59bedb1f16c.gif)

## Preface
This is my first attempt at creating a bot using Node.js, as well as interacting with third-party APIs. There will be a lot of documentation in each class for the readers' and my own sake. Feel free to modify the trading strategy once you understand how the backend works. \
In addition, the plan is to have the bot dockerized and hosted on my Raspberri Pi 3B+, so instructions on [Docker](#docker) will be down below.

## Get Started
Before we begin with the setup, make sure you signed up for [Coinbase Pro](https://pro.coinbase.com) and create an API key. Create a JSON file called **config.json** in the root directory and store your API information with the content layout as follow, replacing placeholder name as needed: 
```
{
    "COINBASE_API_KEY": "YOUR_API_KEY",
    "COINBASE_API_SECRET": "YOUR_API_SECRET",
    "COINBASE_API_PASSPHRASE": "YOUR_API_PASSPHRASE",
    "COINBASE_API_URL": "https://api.pro.coinbase.com",
    "COINBASE_SANDBOX_WS_URL": "wss://ws-feed-public.sandbox.exchange.coinbase.com",
    "COINBASE_WS_URL": "wss://ws-feed.pro.coinbase.com"
}
```

### Node
1. Install Node.js on your machine if you have not already. The best option is to install [nvm (Node Version Manager)](https://github.com/nvm-sh/nvm) for different Node version when working with different projects. For this, I am using version 16, so install Node v.16 by typing in the command line: 
    ```
    nvm install 16
    nvm use 16
    ```
2. Install the dependencies, by cd-ing to root directory and type:
    ```
    npm install
    ```

3. To start a **simulated run** with the bot, type this in command line:
    ```
    node index.js --funds 100 --type trader --strategy simple
    ```
    The bot will have $100 starting fund to work with, and a simple buy/sell strategy of real-time market feed. This will show how the bot functions, and where **you can develop your own strategy and play around with it!** For more info on command line options, type:
    ```
    node index.js --help
    ```
4. To start a **live run** with the bot, make sure you have money in your Coinbase Pro account and type:
    ```
    node index.js --funds [fund_amount] --type trader --strategy macd --live
    ```
    This will run MACD strategy (replace **macd** with your own strategy if you have one) and perform real trades with your provided API credentials. Replace [fund_amount] with the amount you're willing to trade, whether it be everything or just a portion of your amount. 
   
### Docker
1. Install [Docker](https://docs.docker.com/engine/install/ubuntu/) on your preferred platform. In my case, I installed in via Ubuntu.

2. On your terminal, start up the Docker Engine:
    ```
    sudo service docker start
    ```

3. Build the Crypto Bot in current directory by typing:
    ```
    sudo docker build -t cryptobot .
    ```

4. Once built, we have an Image that we can create multiple Containers. Type:
    ```
    sudo docker run --name cryptobot [name_the_bot]
    ```
    to start up a single Crypto Bot container, replacing [name_the_bot] with your desired name. This will run the preset within the Dockerfile, which is a **simulated run** with $100 starting fund and a simple buy/sell strategy.

5. Once you are confident, add a **"--live"** tag to the CMDs in the Dockerfile, change other CMD presets to your liking, remove previously built Image by typing:
    ```
    sudo docker rm cryptobot
    ```
    and repeat step 3 & 4 to rebuild and run the container as a live-bot. \
    *Note*: As opposed to the [Node](#node) approach, messages won't be color-coded in the terminal when running the container.

6. To stop the bot (a running Container), type this in a second terminal:
    ```
    sudo docker stop [name_of_bot]
    ```
