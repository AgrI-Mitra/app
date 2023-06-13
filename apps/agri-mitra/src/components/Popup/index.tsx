import React, { useState, useContext } from 'react';
import styles from './styles.module.css';
import { AppContext } from '../../context';
import router from 'next/router';
import { toast } from 'react-hot-toast';
import axios from 'axios';

interface PopupProps {
  msg: string;
}

const Popup = (props: PopupProps) => {
  const context = useContext(AppContext);
  const [aadhaar, setAadhaar] = useState('');
  const [message, setMessage] = useState(props.msg || '');

  const handleSend = () => {
    if (aadhaar.length !== 12) {
      toast.error('Please enter correct Aadhar number!');
    } else {
      if (router.pathname === '/') {
        router.push('/chat');
      }
      try{
        // axios
        // .get(
        //   `${process.env.NEXT_PUBLIC_BASE_URL}/user/error/${aadhaar}`,
        //   {
        //     headers: {
        //       authorization: `Bearer ${localStorage.getItem('auth')}`,
        //     },
        //   }
        // ).then(res => {
        //   console.log("hello",res)
        // })
        context?.sendMessage(props.msg.trim());
        context?.setShowPopUp(false);
      }catch(err){
        console.error(err);
      }
    }
  };
  const handleClose = () => {
    context?.setShowPopUp(false);
  };

  return (
    <>
    <div className={styles.popupOverlay}></div>
    <div className={styles.popup}>
      <p>Your message: {message}</p>
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

      <div className={styles.popupButtons}>
        <button onClick={handleSend}>Send</button>
        <button onClick={handleClose}>Close</button>
      </div>
    </div>
    </>
  );
};

export default Popup;