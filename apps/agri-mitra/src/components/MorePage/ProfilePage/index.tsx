import styles from './index.module.css';
import React, { useEffect, useState } from 'react';
import Menu from '../../menu';
import ComingSoonPage from '../../coming-soon-page';

const ProfilePage: React.FC = () => {
  return (
    <>
      <div className={styles.container}>
        <h1>Profile Page</h1>
      </div>
      <Menu />
    </>
  );
};

export default ProfilePage;
