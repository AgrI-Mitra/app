import React from 'react';
import callIcon from '../../assets/icons/call-icon.svg';
import crossIcon from '../../assets/icons/crossIcon.svg';
import styles from './index.module.css';
import Image from 'next/image';
import { useLocalization } from '../../hooks';

const DialerPopup: React.FC<any> = ({ setShowDialerPopup }) => {
  const t = useLocalization();

  return (
    <div className={styles.main}>
      <div
        className={styles.crossIconBox}
        onClick={() => setShowDialerPopup(false)}>
        <Image src={crossIcon} alt="crossIcon" layout="responsive" />
      </div>
      <p>
        {t('message.dialer_popup')}
      </p>
      <div className={styles.dialerBox}>
        <a
          href={`tel:1551`}
          className={styles.footerTitle}>
          <div className={styles.callIconBox}>
            <Image src={callIcon} alt="callIcon" layout="responsive" />
          </div>
          {t('label.dial')} 1551
        </a>
      </div>
    </div>
  );
};

export default DialerPopup;
