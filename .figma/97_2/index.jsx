import React from 'react';

import styles from './index.module.scss';

const Component = () => {
  return (
    <div className={styles.vector11}>
      <div className={styles.vector}>
        <img src="../image/mouanfwn-7nrf1o4.svg" className={styles.frame} />
        <p className={styles.rewardPoints}>Reward Points</p>
      </div>
      <div className={styles.vector2} />
      <div className={styles.vector4}>
        <div className={styles.vector3}>
          <img src="../image/mouanfwn-o041x8a.svg" className={styles.frame2} />
        </div>
        <p className={styles.a520Points}>520 Points</p>
        <div className={styles.group}>
          <p className={styles.shareNewsOrReferFrie}>
            Share news or refer friends to earn more
          </p>
          <p className={styles.points}>points.</p>
        </div>
      </div>
      <div className={styles.vector5}>
        <p className={styles.inviteFriends}>Invite Friends</p>
      </div>
      <p className={styles.availableRewards}>Available Rewards</p>
      <div className={styles.vector8}>
        <img src="../image/mouanfwp-df0723n.png" className={styles.vector6} />
        <div className={styles.autoWrapper}>
          <div className={styles.group2}>
            <p className={styles.a100AmazonGift}>₹100 Amazon Gift</p>
            <p className={styles.card}>Card</p>
          </div>
          <p className={styles.a500Pts}>500 pts</p>
        </div>
        <div className={styles.vector7}>
          <p className={styles.inviteFriends}>Redeem</p>
        </div>
      </div>
      <div className={styles.vector10}>
        <img src="../image/mouanfwp-hxj3pzz.png" className={styles.vector6} />
        <div className={styles.autoWrapper}>
          <div className={styles.group2}>
            <p className={styles.a100AmazonGift}>₹150 Google Play</p>
            <p className={styles.card}>Voucher</p>
          </div>
          <p className={styles.a500Pts}>700 pts</p>
        </div>
        <div className={styles.group3}>
          <div className={styles.vector9}>
            <p className={styles.inviteFriends}>Redeem</p>
          </div>
        </div>
      </div>
      <div className={styles.group4}>
        <p className={styles.pointsAreVerifiedThr}>
          Points are verified through your share/referral activity.
        </p>
      </div>
    </div>
  );
}

export default Component;
