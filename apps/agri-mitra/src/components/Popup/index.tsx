import React, { useState, useContext, useCallback } from 'react';
import styles from './styles.module.css';
import { AppContext } from '../../context';
import router from 'next/router';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import RenderVoiceRecorder from '../recorder/RenderVoiceRecorder';
import { useLocalization } from '../../hooks/useLocalization';
import { FormattedMessage } from 'react-intl';
import { useCookies } from 'react-cookie';
import Image from 'next/image';
import crossIcon from '../../assets/icons/crossIcon.svg';
import { v4 as uuidv4 } from 'uuid';
import * as PMKisanErrors from './PMKisanErrors.json'

interface PopupProps {
  msg: string;
}

const Popup = (props: PopupProps) => {
  const t = useLocalization();
  const context = useContext(AppContext);
  const [showInput, setShowInput] = useState(true);
  const [input, setInput] = useState('');
  const [showAadhaar, setShowAadhaar] = useState(false);
  const [aadhaar, setAadhaar] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [isResendingOTP, setIsResendingOTP] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [countdownIntervalId, setCountdownIntervalId] = useState<any>(null);
  const [cookies, setCookie, removeCookie] = useCookies(['access_token']);

  const checkBeneficiaryStatus = async (type: string, input: string) => {
    const data: any = {
      method: 'POST',
      body: JSON.stringify({
        method: 'POST',
        endPoint: '/ChatbotBeneficiaryStatus',
        data:{
          "EncryptedRequest": `{\"Types\":\"${type}\",\"Values\":\"${input}\",\"Token\":\"${process.env.NEXT_PUBLIC_PM_KISAN_TOKEN}\"}`
        }
      }),
      headers: {
        "Content-Type": "Application/json"
      }
    }
    const otpRes: any = await fetch(`api/pmKisanProxy`,data);
    let response = await otpRes.json()
    response = JSON.parse(response.d.output)
    return response
  }

  const sendOTP = async (input: string,type: string): Promise<any> => {
    const data: any = {
      method: 'POST',
      body: JSON.stringify({
        method: 'POST',
        endPoint: '/chatbototp',
        data:{
          "EncryptedRequest": `{\"Types\":\"${type}\",\"Values\":\"${input}\",\"Token\":\"${process.env.NEXT_PUBLIC_PM_KISAN_TOKEN}\"}`
        }
      }),
      headers: {
        "Content-Type": "Application/json"
      }
    }
    const otpRes: any = await fetch(`api/pmKisanProxy`,data);
    let response = await otpRes.json()
    response = JSON.parse(response.d.output)
    return response
  }

  const resendOTP = useCallback(async () => {
    if (isResendingOTP) {
      toast.error(`${t('message.wait_resending_otp')}`);
      return;
    }

    setIsResendingOTP(true);
    try {
      let response = await sendOTP(input,"Mobile")
      if (response.Rsponce === "True") {
        toast.success(`${t('message.otp_sent_again')}`);
        setOtp('');
        setCountdown(30);

        const countdownIntervalId = setInterval(() => {
          setCountdown((prevCountdown) => prevCountdown - 1);
        }, 1000);
        setCountdownIntervalId(countdownIntervalId);

        setTimeout(() => {
          setIsResendingOTP(false);
          clearInterval(countdownIntervalId);
          setCountdownIntervalId(null);
        }, 30000);
      } else {
        toast.error(`${t('error.otp_not_sent')}`);
      }
    } catch (error) {
      toast.error(`${t('error.error.sending_otp')}`);
    }

    return () => {
      if (countdownIntervalId !== null) {
        clearInterval(countdownIntervalId);
      }
    };
  }, [isResendingOTP, t, input, countdownIntervalId]);

  const handleSend = async () => {
    try {
      sessionStorage.setItem('identifier', input);
      let response = await sendOTP(input,"Mobile")
      if (response.Rsponce === 'False') {
        const errorMsg = response.Message;
        console.log(errorMsg)
        toast.error(errorMsg);
        if (
          response.Message ===
          'This mobile number taged with multiple records.'
        ) {
          setShowInput(false);
          setShowAadhaar(true);
        }
      } else {
        toast.success('OTP sent');
        setShowInput(false);
        setShowOtp(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleClose = () => {
    context?.setShowPopUp(false);
  };

  const handleClear = () => {
    setInput('');
    setAadhaar('');
    setOtp('');
  };

  const handleAadhaarSubmit = async () => {
    // checking if aadhaar is a 4 digit number only
    if (aadhaar.length === 4 && /^\d{4}$/.test(aadhaar)) {
      let response = await sendOTP(input + aadhaar,"MobileAadhaar")
      if (response.Rsponce === 'True') {
        toast.success('OTP sent');
        setShowAadhaar(false);
        setShowOtp(true);
      } else {
        toast.error(response.Message);
      }
    } else {
      toast.error('Phone number not found');
    }
  };

  const handleOTPSubmit = async () => {
    if (otp.length === 4) {
        try{
          const data: any = {
            method: 'POST',
            body: JSON.stringify({
              method: 'POST',
              endPoint: '/ChatbotOTPVerified',
              data:{
                "EncryptedRequest": `{\"Types\":\"Mobile\",\"Values\":\"${input}\",\"Token\":\"${process.env.NEXT_PUBLIC_PM_KISAN_TOKEN}\",\"OTP\":\"${otp}\"}`
              }
            }),
            headers: {
              "Content-Type": "Application/json"
            }
          }
          const otpRes: any = await fetch(`api/pmKisanProxy`,data);
          let response = await otpRes.json()
          response = JSON.parse(response.d.output)
          if (response.Rsponce === 'True') {
            context?.setIsMobileAvailable(true);
            context?.sendMessage(props.msg.trim());
            context?.setShowPopUp(false);
            let errors = await checkBeneficiaryStatus("Mobile",input)
            if(errors.Rsponce == "True")
            Object.entries(errors).forEach(([key, value]) => {
              if(key!="Rsponce" && key != "Message"){
                if(value){
                  console.log(`ERRORVALUE: ${key} ${value}`);
                  context?.onMessageReceived({
                    content: {
                      //@ts-ignore
                      title: PMKisanErrors[`${value}`],
                      choices: [],
                      media_url: null,
                      caption: null,
                      msg_type: "text",
                      conversationId: sessionStorage.getItem('conversationId'),
                      messageId: uuidv4(),
                      to: localStorage.getItem('userID')
                    }
                  })
                }
              }
            });
            else {
              context?.setIsMsgReceiving(false)
              toast.error(errors.Message)
            }
            router.push('/chat');
          } else {
            toast.error(`${t('message.invalid_otp')}`);
          }
        } catch(err) {
          console.log(err);
        }
    }
  };

  return (
    <>
      <div className={styles.popupOverlay}></div>
      <div className={styles.popup}>
        {showInput && (
          <div>
            <h2>{t('label.popUpTitle')}</h2>
            <div className={styles.inputBox}>
              <input
                style={{ flex: input ? 0.88 : 1 }}
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              {input && (
                <div
                  style={{ flex: 0.12, display: 'flex', alignItems: 'center' }}
                  onClick={handleClear}>
                  <Image src={crossIcon} alt="" />
                </div>
              )}
            </div>
          </div>
        )}
        {showAadhaar && (
          <div>
            <h2>{t('label.popUpTitle2')}</h2>
            <div className={styles.inputBox}>
              <input
                style={{ flex: input ? 0.88 : 1 }}
                value={aadhaar}
                onChange={(e) => setAadhaar(e.target.value)}
              />
              {aadhaar && (
                <div
                  style={{ flex: 0.12, display: 'flex', alignItems: 'center' }}
                  onClick={handleClear}>
                  <Image src={crossIcon} alt="" />
                </div>
              )}
            </div>
          </div>
        )}
        {showOtp && (
          <div>
            <h2>{t('label.popUpTitle3')}</h2>
            <div className={styles.inputBox}>
              <input
                style={{ flex: input ? 0.88 : 1 }}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              {otp && (
                <div
                  style={{ flex: 0.12, display: 'flex', alignItems: 'center' }}
                  onClick={handleClear}>
                  <Image src={crossIcon} alt="" />
                </div>
              )}
            </div>

            <div className={styles.resendOTP}>
              {countdown > 0 ? (
                <span>
                  <FormattedMessage
                    id="message.wait_minutes"
                    defaultMessage="Please wait {countdown} seconds before resending OTP"
                    values={{ countdown }}
                  />
                </span>
              ) : (
                <>
                  <span>{t('message.didnt_receive')} &nbsp;</span>
                  <p style={{ margin: '0' }} onClick={resendOTP}>
                    {t('message.resend_again')}
                  </p>
                </>
              )}
            </div>
          </div>
        )}
        <div className={styles.popupButtons}>
          <div style={{ height: '45px', width: '45px' }}>
            {showInput ? (
              <RenderVoiceRecorder setInputMsg={setInput} wordToNumber={true} />
            ) : showOtp ? (
              <RenderVoiceRecorder setInputMsg={setOtp} wordToNumber={true} />
            ) : (
              <RenderVoiceRecorder
                setInputMsg={setAadhaar}
                wordToNumber={true}
              />
            )}
          </div>
          <button onClick={handleClose}>{t('label.close')}</button>
          {showInput ? (
            <button onClick={handleSend}>{t('label.send')}</button>
          ) : showOtp ? (
            <button onClick={handleOTPSubmit}>{t('label.send')}</button>
          ) : (
            <button onClick={handleAadhaarSubmit}>{t('label.send')}</button>
          )}
        </div>
      </div>
    </>
  );
};

export default Popup;
