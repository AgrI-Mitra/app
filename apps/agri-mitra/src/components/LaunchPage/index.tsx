import styles from './index.module.css';
import Logo from "../../assets/images/MOA_logo.png";
import Image from "next/image";
import { useLocalization } from '../../hooks';

function LaunchPage() {
  const t = useLocalization();
  return (
    <div className={`${styles.container}`}>
      <Image
              className={styles.loginImage}
              src={Logo}
              alt="Logo"
              width={235}
              height={235}
            />
            <span>{t('label.title')}</span>
    </div>
  )
}

export default LaunchPage