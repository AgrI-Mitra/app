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

  const handleSend = async () => {
    try {
      sessionStorage.setItem('identifier', input+(aadhaar.length>0?aadhaar:''));
      // const response = await fetch(
      //   `${process.env.NEXT_PUBLIC_BASE_URL}/user/linkedBeneficiaryIdsCount/${input}`,
      //   {
      //     method: 'GET',
      //   }
      // );

      // if (!response.ok) {
      //   toast.error(response.statusText);
      // }

      // const res = await response.json();
      // console.log(res);

      // if (res.status === 'OK') {
      //   if (res.beneficiaryIdCount === 0) {
      //     if (res.type === 'phoneNumber') {
      //       toast.error(
      //         'Dear user, we are unable to find the requested phone number. Please check the input.'
      //       );
      //     } else if (res.type === 'aadhaar') {
      //       toast.error(
      //         'Dear user, we are unable to find the requested Aadhaar number. Please check the input.'
      //       );
      //     } else if (res.type === 'beneficiaryId') {
      //       toast.error(
      //         'Dear user, we are unable to find the requested Beneficiary ID. Please check the input.'
      //       );
      //     }
      //   } else if (res.beneficiaryIdCount > 1 && res.type === 'phoneNumber') {
      //     setShowInput(false);
      //     setShowAadhaar(true);
      //   } else {
      const otpResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/user/sendotp/${input}`,
        {
          method: 'GET',
        }
      );

      const otpRes = await otpResponse.json();
      console.log(otpRes);
      if (otpRes.status === 'NOT_OK') {
        const errorMsg = otpRes?.d?.output?.Message || otpRes?.error;
        toast.error(errorMsg);
        if (
          otpRes.d.output.Message ===
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
      // }
      // } else {
      //   toast.error(res.error);
      // }
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

  const handleAadhaarSubmit = () => {
    // checking if aadhaar is a 4 digit number only
    if (aadhaar.length === 4 && /^\d{4}$/.test(aadhaar)) {
      sessionStorage.setItem('identifier', input+(aadhaar.length>0?aadhaar:''));
      // fetch(
      //   `${process.env.NEXT_PUBLIC_BASE_URL}/user/checkMapping?phoneNo=${input}&maskedAadhaar=${aadhaar}`,
      //   { method: 'GET' }
      // ).then(async (response) => {
      //   const res = await response.json();
      //   // if mapped to a phone number then only send otp
      //   if (res.status) {

      fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/user/sendotp/${input + aadhaar}`,
        {
          method: 'GET',
        }
      ).then(async (response) => {
        const aadhaarRes = await response.json();
        console.log('hey', aadhaarRes);
        if (aadhaarRes.status === 'OK') {
          toast.success('OTP sent');
          setShowAadhaar(false);
          setShowOtp(true);
        } else {
          // toast.error(`${t('message.otp_not_sent')}`);
          toast.error(aadhaarRes.d.output.Message);
        }
      });
    } else {
      toast.error('Phone number not found');
    }
    //   });
    // } else {
    //   toast.error('Please enter last 4 digits of your Aadhaar.');
    // }
  };

  const handleOTPSubmit = () => {
    if (otp.length === 4) {
      // Check if the function is already running
      if (context?.OTPSubmitting) {
        return;
      }

      context.setOTPSubmitting(true);

      fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/user/verifyotp`, {
        method: 'POST',
        body: JSON.stringify({
          identifier: input+(aadhaar.length>0?aadhaar:''),
          otp: otp,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then((data) => {
          // console.log('token:', { data });
          if (data.status === 'OK') {
            //   let expires = new Date();
            //   expires.setTime(
            //     expires.getTime() +
            //       data.result.data.user.tokenExpirationInstant * 1000
            //   );
            //   removeCookie('access_token');
            //   setCookie('access_token', data.result.data.user.token, {
            //     path: '/',
            //     expires,
            //   });
            // localStorage.setItem('auth', data.result.data.user.token);
            context?.setIsMobileAvailable(true);
            context?.sendMessage(props.msg.trim());
            context?.setShowPopUp(false);
            router.push('/chat');
            context?.setOTPSubmitting(false);
          } else {
            toast.error(`${t('message.invalid_otp')}`);
            context?.setOTPSubmitting(false);
          }
        })
        .catch((err) => {
          console.log(err);
          context?.setOTPSubmitting(false);
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
            <button onClick={handleOTPSubmit}>{t('label.submit')}</button>
          ) : (
            <button onClick={handleAadhaarSubmit}>{t('label.send')}</button>
          )}
        </div>
      </div>
    </>
  );
};

export default Popup;
