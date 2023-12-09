import UssdMenu from "ussd-menu-builder";
import africastalking from "africastalking";
import createWallet from "../utils/walletCreation";

const menu = new UssdMenu();

const credentials = {
    apiKey: 'sandbox',
    username: 'sandbox'
};

// const africastalking = AfricasTalking(credentials);

const ussdImplementation = async(req, res)=> {



menu.startState({
    run: () => {
        menu.con(`Welcome to the celo USSD blockchain app`);
    },
    next: {
        '1': 'createWallet',
        '2': 'checkBalance',
        '3': 'sendMoney',
        '4': 'receiveMoney',
        '5': 'buyAirtime',
        '6': 'buyData',
        '7': 'checkWallet',
        '8': 'exit'
    }
});
menu.state('createWallet', {
    run: () => {
        menu.con('Enter your phone number');
    },
    next: {
        '*[0-9]+': 'createWallet.confirm'
    }
});
menu.state('createWallet.confirm', {
    run: async () => {
        const phoneNumber = menu.val;
        const wallet = await createWallet(phoneNumber);
        menu.end(`Your wallet address is ${wallet.address}`);
    }
});
menu.state('end', {
    run: () => {
        menu.end(`send and recieve funds with your new wallet`);
    }
});
menu.state('quit', {
    run: () => {
        menu.end(`Thank you for using the celo USSD blockchain app`);
    }
});
}

export default ussdImplementation;