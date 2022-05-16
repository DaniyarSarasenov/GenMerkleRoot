import {NotificationContainer, NotificationManager} from 'react-notifications';
import 'react-notifications/lib/notifications.css';

import './App.css';
import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemButton,
  AccordionItemPanel,
} from 'react-accessible-accordion';
import { useEffect, useState } from "react";
import Select from 'react-select';

import whitelist from './wl/whitelist.json';
import wl1 from './wl/w1.json';
import wl2 from './wl/w2.json';
import wl3 from './wl/w3.json';

function App() {
  const [root, setRoot] = useState('');
  const [outdata, setOutdata] = useState('');
  const [address, setAddress] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);

  const options = [
    {value: 'wl1', label: 'wl1'},
    {value: 'wl2', label: 'wl2'},
    {value: 'wl3', label: 'wl3'},
    {value: 'whitelist', label: 'whitelist'},
  ];

  const notificationfunc = (type, message) => {
    switch (type) {
      case 'info':
        NotificationManager.info(message);
        break;
      case 'success':
        NotificationManager.success(message);
        break;
      case 'warning':
        NotificationManager.warning(message, 'Warning', 3000);
        break;
      case 'error':
        NotificationManager.error(message, 'Error', 3000);
        break;
      default:
        break;
    }
  }

  const buf2hex = x => '0x'+x.toString('hex')

  const getRoot = () => {
    const { MerkleTree } = require('merkletreejs')
    const keccak256 = require('keccak256');
    const { soliditySha3 } = require("web3-utils");
    const { BN } = require("bn.js");

    if (selectedOption == null) {
      return;
    }

    const selectedValue = selectedOption.value;
    const wlUsers = selectedValue == 'wl1' ? wl1 : 
      selectedValue == 'wl2' ? wl2 : 
      selectedValue == 'wl3' ? wl3 : 
      selectedValue == 'whitelist' ? whitelist : [];

    const leaves = wlUsers.map(x => keccak256(x));

    const tree = new MerkleTree(leaves, keccak256, {sortPairs: true});
    const root_ = tree.getRoot().toString('hex');
    const root = tree.getRoot();
    const hexroot = buf2hex(root);

    setRoot(hexroot);
  };

  const getProofs = () => {
    if (address == '') {
      notificationfunc('error', 'input address'); return;
    }

    const { MerkleTree } = require('merkletreejs')
    const keccak256 = require('keccak256');
    const { soliditySha3 } = require("web3-utils");
    const { BN } = require("bn.js");

    if (selectedOption == null) {
      return;
    }
    
    const selectedValue = selectedOption.value;
    const wlUsers = selectedValue == 'wl1' ? wl1 : 
    selectedValue == 'wl2' ? wl2 : 
    selectedValue == 'wl3' ? wl3 : 
    selectedValue == 'whitelist' ? whitelist : [];

    var is_whitelist = false;
    var mint_type = "";
    var my_index = 0;
    
    wlUsers.map(wallet => {
      if (address.toLowerCase() === wallet.toLowerCase()) {
        is_whitelist = true;
      }
    });

    // for(var wallet in wlUsers) {
    //   console.log(wallet.toLowerCase());
    //   if (address.toLowerCase() === wallet.toLowerCase()) {
    //     break;
    //   }
    //   my_index++;
    // }

    if (!is_whitelist) {
      notificationfunc('error', 'Address is not in whitelist'); 
      setOutdata("");
      return;
    }

    const leaves = wlUsers.map(x => keccak256(x));

    const tree = new MerkleTree(leaves, keccak256, {sortPairs: true});
    const root_ = tree.getRoot().toString('hex');
    const root = tree.getRoot(address);
    const hexroot = buf2hex(root);

    const leaf = keccak256(address);
    let proof = tree.getProof(leaf);
    let hexProof = tree.getHexProof(leaf);

    console.log("root-- ", hexroot, root_, buf2hex(leaf));

    let proofString = "[";
    hexProof.map(v => {
      proofString += "\"" + v + "\",\n";
      return v;
    });
    proofString = proofString.substring(0, proofString.length - 2);
    proofString += "]";

    setOutdata("Proofs:" +proofString);
  };

  useEffect(() => {
    getRoot();
  }, [selectedOption]);

  return (
    <div className="App">
      <div className="container-fluid main-container">
        <div className="container">
          <div className="sub-container">
            <div className="title">Mode Root</div>
            <Select 
              options={options} 
              defaultValue={selectedOption}
              onChange={setSelectedOption}
            />
          </div>

          <div className="sub-container">
            <div className="title" >Merkle root</div>
            <input className="" type="text" value={root} />
            <div className="mint-wrapper" >
              <button type="button" className="form-mint" disabled="" onClick={()=> getRoot()}>GetRoot</button>
            </div>
          </div>
          
          <div className="sub-container">
            <div className="title" >Address</div>
            <input className="" type="text" value={address} onChange={(e) => setAddress(e.target.value)}/>
            <div className="mint-wrapper" >
              <button type="button" className="form-mint" onClick={()=> getProofs()}>GetProofs</button>
            </div>
          </div>

          <div className="sub-container">
            <div className="title" >Proofs info</div>
            <textarea  type="text" value={outdata}></textarea>
            <div className="mint-wrapper" >
              
            </div>
          </div>
          
        </div>
            
        
      </div>
      <NotificationContainer/>
    </div>
  );
}

export default App;
