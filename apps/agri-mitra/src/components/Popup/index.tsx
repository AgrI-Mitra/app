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

  const resendOTP = useCallback(async () => {
    if (isResendingOTP) {
      toast.error(`${t('message.wait_resending_otp')}`);
      return;
    }

    setIsResendingOTP(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/user/sendotp/${input}`
      );
      if (response.status === 200) {
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

  const handleSend = () => {
    // if (router.pathname === '/') {
      // check whether to ask for aadhaar 4 digits or not
      fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/user/linkedBeneficiaryIdsCount/${input}`,
        { method: 'GET' }
      ).then(async (response) => {
        const res = await response.json();
        console.log(res);
        if (res.status === 'OK') {
          // If beneficiary ID are zero then wrong value entered
          if (res.beneficiaryIdCount === 0) {
            toast.error(
              'Dear user we are unable to find the requested beneficiaryID. Please enter correct beneficiaryID.'
            );
            // if more than one beneficiary then ask for aadhaar digits
          } else if (res.beneficiaryIdCount > 1) {
            setShowInput(false);
            setShowAadhaar(true);
            // if exactly one beneficiary then send otp
          } else {
            fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/user/sendotp/${input}`, {
              method: 'GET',
            }).then((response) => {
              if (response.status === 200) {
                toast.success('OTP sent');
                setShowInput(false);
                setShowOtp(true);
              } else {
                toast.error(`${t('message.otp_not_sent')}`);
              }
            });
          }
        } else {
          toast.error(res.error);
        }
      });
    // }
  };

  const handleClose = () => {
    context?.setShowPopUp(false);
  };

  const handleAadhaarSubmit = () => {
    if (aadhaar.length === 4) {
      fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/user/checkMapping?phoneNo=${input}&maskedAadhaar=${aadhaar}`,
        { method: 'GET' }
      ).then(async (response) => {
        const res = await response.json();
        // if mapped to a phone number then only send otp
        if (res.status) {
          fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/user/sendotp/${input}`, {
            method: 'GET',
          }).then((response) => {
            if (response.status === 200) {
              toast.success('OTP sent');
              setShowAadhaar(false);
              setShowOtp(true);
            } else {
              toast.error(`${t('message.otp_not_sent')}`);
            }
          });
        } else {
          toast.error('Phone number not found');
        }
      });
    } else {
      toast.error('Please enter last 4 digits of your Aadhaar.');
    }
  };

  const handleOTPSubmit = () => {
    if (otp.length === 4) {
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/user/verifyotp`, {
        method: 'POST',
        body: JSON.stringify({
          identifier: input,
          otp: otp,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('token:', { data });
          if (data.params.status === 'Success') {
            let expires = new Date();
            expires.setTime(
              expires.getTime() +
                data.result.data.user.tokenExpirationInstant * 1000
            );
            removeCookie('access_token');
            setCookie('access_token', data.result.data.user.token, {
              path: '/',
              expires,
            });
            // localStorage.setItem('auth', data.result.data.user.token);
            context?.setIsMobileAvailable(true);
            context?.sendMessage(props.msg.trim());
            context?.setShowPopUp(false);
            router.push('/chat');
          } else {
            toast.error(`${t('message.invalid_otp')}`);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  return (
    <>
      <div className={styles.popupOverlay}></div>
      <div className={styles.popup}>
        {showInput && (
          <div>
            <h2>{t('label.popUpTitle')}</h2>
            <input value={input} onChange={(e) => setInput(e.target.value)} />
          </div>
        )}
        {showAadhaar && (
          <div>
            <h2>{t('label.popUpTitle2')}</h2>
            <input
              value={aadhaar}
              onChange={(e) => setAadhaar(e.target.value)}
            />
          </div>
        )}
        {showOtp && (
          <div>
            <h2>{t('label.popUpTitle3')}</h2>
            <input value={otp} onChange={(e) => setOtp(e.target.value)} />

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
