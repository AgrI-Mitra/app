import React, { useState, useContext } from 'react';
import styles from './styles.module.css';
import { AppContext } from '../../context';
import router from 'next/router';
import { toast } from 'react-hot-toast';

interface PopupProps {
  msg: string;
}

const Popup = (props: PopupProps) => {
  const context = useContext(AppContext);
  const [aadhaar, setAadhaar] = useState('');

  const handleSend = () => {
    if (aadhaar.length !== 12) {
      toast.error('Please enter correct Aadhar number!');
    } else {
      if (router.pathname === '/') {
        router.push('/chat');
      }
      context?.sendMessage(props.msg.trim());
      context?.setShowPopUp(false);
    }
  };
  const handleClose = () => {
    context?.setShowPopUp(false);
  };

  return (
    <div className={styles.popup}>
      <h2>Enter your Aadhar Number</h2>
      <input
        type="number"
        value={aadhaar}
        onChange={(e) => {
          if (e.target.value.length <= 12) {
            // check length of input before updating state
            setAadhaar(e.target.value);
          }
        }}
        maxLength={12} // add maxLength attribute
      />

      <div>
        <button onClick={handleSend}>Send</button>
        <button onClick={handleClose}>Close</button>
      </div>
    </div>
  );
};

export default Popup;
