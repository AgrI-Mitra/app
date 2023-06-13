import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Stop from '../../assets/icons/stop.gif';
import Start from '../../assets/icons/startIcon.svg';
import AudioReactRecorder, { RecordState } from 'audio-react-recorder';
import { Grid, Typography, Button } from '@material-ui/core';
import styles from './styles.module.css';
import ComputeAPI from './Model/ModelSearch/HostedInference';
import toast from 'react-hot-toast';
import { AppContext } from '../../context';
import { useLocalization } from '../../hooks';
import flagsmith from 'flagsmith/isomorphic';

const RenderVoiceRecorder = ({ setInputMsg }) => {
  const model_id_1 = flagsmith.getValue('model_id_1');
  const model_id_2 = flagsmith.getValue('model_id_2');
  const t = useLocalization();
  const [gender, setGender] = useState('female');
  const [recordAudio, setRecordAudio] = useState('');
  const [base, setBase] = useState('');
  const [data, setData] = useState('');
  const [outputBase64, setOutputBase64] = useState('');
  const [suggestEditValues, setSuggestEditValues] = useState({
    asr: '',
    translation: '',
  });
  const [audio, setAudio] = useState('');
  const [output, setOutput] = useState({
    asr: '',
    translation: '',
  });
  const [filter, setFilter] = useState({
    src: 'hi',
    tgt: 'en',
    asr: '',
    translation: '',
    tts: '',
  });

  const handleStopRecording = () => {
    setRecordAudio(RecordState.STOP);
  };

  const handleStartRecording = () => {
    setRecordAudio(RecordState.START);
  };

  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64data = reader.result;
        resolve(base64data);
      };

      reader.onerror = (error) => {
        reject(error);
      };

      reader.readAsDataURL(blob);
    });
  };

  useEffect(() => {
    if (data && base) {
      handleCompute();
      setData();
      setBase();
    }
  }, [data, handleCompute, base]);

  const onStopRecording = async (data) => {
    setData(data.url);
    try {
      const base64Data = await blobToBase64(data.blob);
      setBase(base64Data);
      //  setTimeout(()=>{
      //   handleCompute()
      //  },50)
      // setOutput({
      //   asr: '',
      //   translation: '',
      // });
    } catch (error) {
      console.error('Error converting Blob to Base64:', error);
    }
  };

  const b64toBlob = (b64Data, contentType = '', sliceSize = 512) => {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: contentType });
    return blob;
  };

  const [modelId, source] = useMemo(() => {
    if (localStorage.getItem('locale') === 'en') {
      return [model_id_1, 'hi'];
    }
    return [model_id_2, 'or'];
  }, [model_id_1, model_id_2]);

  const makeComputeAPICall = async (type) => {
    if (!(localStorage.getItem('locale') === 'en')) {

      const url =
        'https://api.dhruva.ai4bharat.org/services/inference/asr?serviceId=ai4bharat%2Fconformer-multilingual-indo_aryan-gpu--t4';
      const headers = {
        'Content-Type': 'application/json',
        authorization: process.env.NEXT_PUBLIC_DHRUVA_AUTH,
      };

      const data = {
        config: {
          language: {
            sourceLanguage: 'hi',
          },
        },
        audio: [
          {
            audioContent: base.split('base64,')[1],
          },
        ],
      };

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(data),
        });

        if (response.ok) {
          const text = await response.json();
          setInputMsg(text?.output?.[0]?.source);
        } else {
          console.error('Error:', response.status);
        }
      } catch (err) {
        toast.error(`${t('message.recorder_error')}`);
      }

      return;
    }
    toast.success(`${t('message.recorder_wait')}`);
    setAudio(null);

    const apiObj = new ComputeAPI(
      modelId, //modelId

      type === 'url' ? url : base, //input URL
      'asr', //task
      type === 'voice' ? true : false, //boolean record audio
      source, //source
      filter.asr.inferenceEndPoint, //inference endpoint
      '' //gender
    );
    // const apiObj = new ComputeAPI(
    //   filter.asr.value, //modelId
    //   type === 'url' ? url : base, //input URL
    //   'asr', //task
    //   type === 'voice' ? true : false, //boolean record audio
    //   filter.src.value, //source
    //   filter.asr.inferenceEndPoint, //inference endpoint
    //   '' //gender
    // );

    console.log('ghji:', { body: apiObj.getBody() });
    fetch(apiObj.apiEndPoint(), {
      method: 'post',
      body: JSON.stringify(apiObj.getBody()),
      headers: apiObj.getHeaders().headers,
    })
      .then(async (resp) => {
        let rsp_data = await resp.json();
        if (resp.ok && rsp_data !== null) {
          setOutput((prev) => ({ ...prev, asr: rsp_data.data.source }));
          // setInputMsg(rsp_data.data.source);
          setInputMsg("मेरा पैसा कहाँ है");
          setSuggestEditValues((prev) => ({
            ...prev,
            asr: rsp_data.data.source,
          }));

          // const obj = new ComputeAPI(
          //   filter.translation.value,
          //   rsp_data.data.source,
          //   'translation',
          //   '',
          //   '',
          //   filter.translation.inferenceEndPoint,
          //   ''
          // );
          // fetch(obj.apiEndPoint(), {
          //   method: 'post',
          //   body: JSON.stringify(obj.getBody()),
          //   headers: obj.getHeaders().headers,
          // })
          //   .then(async (translationResp) => {
          //     let rsp_data = await translationResp.json();
          //     if (translationResp.ok) {
          //       setOutput((prev) => ({
          //         ...prev,
          //         translation: rsp_data.output[0].target,
          //       }));
          //       setSuggestEditValues((prev) => ({
          //         ...prev,
          //         translation: rsp_data.output[0].target,
          //       }));
          //       const obj = new ComputeAPI(
          //         filter.tts.value,
          //         rsp_data.output[0].target,
          //         'tts',
          //         '',
          //         '',
          //         filter.tts.inferenceEndPoint,
          //         gender
          //       );
          //       fetch(obj.apiEndPoint(), {
          //         method: 'post',
          //         headers: obj.getHeaders().headers,
          //         body: JSON.stringify(obj.getBody()),
          //       })
          //         .then(async (ttsResp) => {
          //           let rsp_data = await ttsResp.json();
          //           if (ttsResp.ok) {
          //             if (rsp_data.audio[0].audioContent) {
          //               const blob = b64toBlob(
          //                 rsp_data.audio[0].audioContent,
          //                 'audio/wav'
          //               );
          //               setOutputBase64(rsp_data.audio[0].audioContent);
          //               const urlBlob = window.URL.createObjectURL(blob);
          //               setAudio(urlBlob);
          //             } else {
          //               setOutputBase64(rsp_data.audio[0].audioUri);
          //               setAudio(rsp_data.audio[0].audioUri);
          //             }
          //           } else {
          //             toast.error(rsp_data.message);
          //           }
          //         })
          //         .catch(async (error) => {
          //           toast.error(
          //             'Unable to process your request at the moment. Please try after sometime.'
          //           );
          //         });
          //   } else {
          //     toast.error(rsp_data.message);
          //   }
          // })
          // .catch(async (error) => {
          //   toast.error(
          //     'Unable to process your request at the moment. Please try after sometime.'
          //   );
          // });
        } else {
          toast.error(rsp_data.message);
        }
      })
      .catch(async (error) => {
        toast.error(`${t('message.recorder_error')}`);
      });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleCompute = () => {
    makeComputeAPICall('voice');
  };
  console.log('ghji', { output });
  return (
    <div>
      <div>
        {recordAudio === 'start' ? (
          <div className={styles.center}>
            <Image
              src={Stop}
              alt="stopIcon"
              onClick={() => handleStopRecording()}
              style={{ cursor: 'pointer' }}
              layout="responsive"
            />{' '}
          </div>
        ) : (
          <div className={styles.center}>
            <Image
              src={Start}
              alt="startIcon"
              onClick={() => {
                handleStartRecording();
              }}
              style={{ cursor: 'pointer' }}
              layout="responsive"
            />{' '}
          </div>
        )}
      </div>
      <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
        {/* <div className={styles.center}>
          <Typography style={{ height: '12px' }} variant="caption">
            {recordAudio === 'start' ? 'Recording...' : ''}
          </Typography>{' '}
        </div> */}
        <div style={{ display: 'none' }}>
          <AudioReactRecorder
            state={recordAudio}
            onStop={onStopRecording}
            style={{ display: 'none' }}
          />
        </div>
        {/* <div className={styles.centerAudio} style={{ height: '60px' }}>
          {data ? (
            <audio
              src={data}
              style={{ minWidth: '100%' }}
              controls
              id="sample"></audio>
          ) : (
            <></>
          )}
        </div> */}
      </Grid>
      <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
        <Grid container spacing={1}>
          {/* <Grid item xs={8} sm={12} md={10} lg={10} xl={10}>
            <Typography variant={'caption'}>Max duration: 1 min</Typography>
          </Grid> */}
          <Grid
            item
            xs={4}
            sm={12}
            md={2}
            lg={2}
            xl={2}
            className={styles.flexEndStyle}>
            {/* <Button
              style={{}}
              color="primary"
              variant="contained"
              size={'small'}
              disabled={data ? false : true}
              onClick={() => handleCompute()}>
              Convert
            </Button> */}
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
};

export default RenderVoiceRecorder;