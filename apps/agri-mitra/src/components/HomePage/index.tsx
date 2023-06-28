import styles from './index.module.css';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { NextPage } from 'next';
import Menu from '../menu';
import { getInitialMsgs } from '../../utils/textUtility';
import { AppContext } from '../../context';
import speakerIcon from '../../assets/icons/speakerHome.svg';
import RightIcon from '../../assets/icons/right';
import sunIcon from '../../assets/icons/sun.svg';
import reloadIcon from '../../assets/icons/reload.svg';
import { useLocalization } from '../../hooks';
import Image from 'next/image';
import { Button } from '@chakra-ui/react';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import RenderVoiceRecorder from '../recorder/RenderVoiceRecorder';
import Popup from '../Popup';
import { textToSpeech } from '../../utils/textToSpeech';
import ComputeAPI from '../recorder/Model/ModelSearch/HostedInference';

const HomePage: NextPage = () => {
  const context = useContext(AppContext);
  const t = useLocalization();
  const placeholder = useMemo(() => t('message.ask_ur_question'), [t]);

  // const [messages, setMessages] = useState<Array<any>>([
  //   getInitialMsgs(t),
  // ]);
  const [messages, setMessages] = useState<Array<any>>([]);
  const [inputMsg, setInputMsg] = useState('');

  // useEffect(() => {
  //   setMessages([getInitialMsgs(t)]);
  // }, [t]);

  useEffect(() => {
    context?.fetchIsDown(); // check if server is down

    if (!sessionStorage.getItem('conversationId')) {
      const newConversationId = uuidv4();
      sessionStorage.setItem('conversationId', newConversationId);
      context?.setConversationId(newConversationId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendMessage = useCallback(
    async (msg: string) => {
      if (msg.length === 0) {
        toast.error(t('error.empty_msg'));
        return;
      }
      // try {
      //   if (!(localStorage.getItem("locale") === "en")) {
      //     const words = msg.split(" ");
      //     // Call transliteration API
      //     const input = words.map((word) => ({
      //       source: word,
      //     }));

      //     const response = await axios.post(
      //       "https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/compute",
      //       {
      //         modelId: process.env.NEXT_PUBLIC_TRANSLITERATION_MODELID,
      //         task: "transliteration",
      //         input: input,
      //       },
      //       {
      //         headers: {
      //           "Content-Type": "application/json",
      //         },
      //       }
      //     );
      //     console.log("transliterated msg: ", response.data.output);
      //     const transliteratedArray = [];
      //     for (const element of response.data.output) {
      //       transliteratedArray.push(element?.target?.[0]);
      //     }

      //     if (context?.socketSession && context?.newSocket?.connected) {
      //       console.log("clearing mssgs");
      //       context?.setMessages([]);
      //       router.push("/chat");
      //       context?.sendMessage(transliteratedArray.join(" "));
      //     } else {
      //       toast.error(t("error.disconnected"));
      //       return;
      //     }
      //   } else {
      // if (context?.socketSession && context?.newSocket?.connected) {
        console.log('clearing mssgs');
        context?.setMessages([]);
        setInputMsg(msg);
        context?.setShowPopUp(true);
      // } else {
      //   toast.error(t('error.disconnected'));
      //   return;
      // }
      // }
      // } catch (error) {
      //   console.error(error);
      // }
    },
    [context, t]
  );

  const ttsHandler = useCallback(
    async (text: string) => {
      let modelId;
      const lang = localStorage.getItem('locale') || 'en';
      // console.log(lang)
      switch (lang) {
        case 'bn':
          modelId = '621774da7c69fa1fc5bba7d6';
          break;
        case 'en':
          modelId = '623ac7b27c69fa1fc5bba7df';
          break;
        case 'ta':
          modelId = '61ea3b171121fa5fec13aeb1';
          break;
        case 'te':
          modelId = '620cd101bedccf5280e4eb26';
          break;
        default:
          modelId = '61ea3ab41121fa5fec13aeaf';
      }
      const obj = new ComputeAPI(
        modelId,
        text,
        'tts',
        '',
        '',
        '',
        'female'
      );
      try {
        let audio;
        // if (!context?.audioRef.current) {
        const res = await textToSpeech(obj);
        audio = new Audio(res);
        // }else{
        //   audio = context?.audioRef.current;
        // }

        audio.addEventListener('ended', () => {
          context && (context.audioRef.current = null);
          context?.setIsAudioPlaying(false);
        });

        if (context?.audioRef.current === audio) {
          if (context?.isAudioPlaying) {
            audio.pause();
          } else {
            audio.play();
          }
          context?.setIsAudioPlaying(!context?.isAudioPlaying);
        } else {
          if (context?.audioRef.current) {
            context?.audioRef.current.pause();
          }
          context && (context.audioRef.current = audio);
          audio.play();
          context?.setIsAudioPlaying(true);
        }
      } catch (err) {
        console.error(err);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [context?.isAudioPlaying, context?.context?.audioRef]
  );

  return (
    <>
      {context?.showPopUp && <Popup msg={inputMsg} />}
      <div className={styles.main}>
        {/* {!(context?.socketSession && context?.newSocket?.connected) && (
          <div className={styles.disconnected}>
            <p>You are disconnected &nbsp;</p> 
            <div
                onClick={() => {
                  context?.onSocketConnect({text: ""});
                }}
              >
                <Image src={reloadIcon} alt="reloadIcon" width={24} height={24}/>
              </div>
          </div>
        )} */}
        {/* <div className={styles.sunIconContainer}>
          <Image src={sunIcon} alt="sunIcon" layout="responsive" />
        </div> */}
        <div className={styles.voiceRecorder}>
          <RenderVoiceRecorder
            setInputMsg={setInputMsg}
            wordToNumber={false}
          />
        </div>
        <div className={styles.title}>{messages?.[0]?.payload?.text}</div>
        {messages?.[0]?.payload?.buttonChoices?.map((choice: any) => {
          return (
            <div key={choice.key} className={styles.buttonChoice}>
              <button onClick={() => sendMessage(choice.text)}>
                {choice.text}
              </button>
              <div
                className={styles.rightIcon}
                onClick={() => ttsHandler(choice.text)}>
                <Image src={speakerIcon} alt="" layout="responsive" />
              </div>
            </div>
          );
        })}
        <form onSubmit={(event) => event?.preventDefault()}>
          <div className={styles.inputBox}>
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder={placeholder}
            />
            <button
              type="submit"
              onClick={() => sendMessage(inputMsg)}
              className={styles.sendButton}>
              {t('label.send')}
            </button>
          </div>
        </form>
      </div>
      <Menu />
    </>
  );
};

export default HomePage;
