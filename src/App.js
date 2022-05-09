import logo from './logo.svg';
import './App.css';
import * as React from 'react';

const GET_WALLET_INFO_REQUEST = {
  tag: "SyloWallet:>",
  value:{
    id: "client:1",
    payload: undefined,
    tag: "public/get_active_wallet"
  }
};



function App() {

  const [connected, setConnected] = React.useState(false);
  const [wallet, setWallet] = React.useState(null);


  const sendMessageToExtension = React.useCallback((message)=>{
    window.postMessage(message);
  },[])

  const extensionMessageListener = React.useCallback((msg)=>{
    if(msg?.data?.tag !== 'SyloWallet:<'){
      return
    }
    const extensionMessage = msg.data.value;
    if(extensionMessage?.tag == null){
      return
    }
    console.log('[ext->web][msg]',extensionMessage)

    if(extensionMessage.tag === 'content-script/installed'){
      // this means extension is connected and ready to use.
      setConnected(true);
    }

    if(extensionMessage.tag === 'content-script/port-disconnected'){
      // this means extension is disconnected
      setConnected(false);
    }
    
    if(extensionMessage.tag === 'public/get_active_wallet'){
      setWallet(extensionMessage.payload);
    }

  },[]);

  React.useEffect(()=>{
    if(!connected){
      return;
    }

    sendMessageToExtension(GET_WALLET_INFO_REQUEST)

  },[connected, sendMessageToExtension])

  // add ext->web message listener
  React.useEffect(()=>{
    window.addEventListener('message',extensionMessageListener);

    return ()=>{
      window.removeEventListener('message',extensionMessageListener);
    }
  },[extensionMessageListener])

  return (
    <div className="App">
      <header className="App-header">
        <p>
          HD wallet interaction demo
        </p>

        <div>connected/installed: {connected ? 'yes' : 'no'}</div>
        <br />
        <div>wallet: {wallet == null ? 'N/A' : JSON.stringify(wallet, null, 2)}</div>
        
      </header>
    </div>
  );
}

export default App;
