
import { Geist, Geist_Mono, Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { useRouter } from "next/router";
import Navbar from "@/components/Navbar";

const inter = Inter({ susbsets: ["latin"] });
export default function Home() {
  const router = useRouter();
  return (
    <>
    <Navbar/>
      <div className={styles.container}>
        <div className={styles.mainContainer}>
          <div className={styles.mainContainer_left}>
            <p>connect with friend without exaggeration</p>
            <p>true social media platform , with stories no bluffs</p>
            <div
            onClick={() => {
              router.push("/login");
            }}
            className={styles.buttonJoin}
          >
            <p>join now</p>
          </div>
          </div>
          <div className={styles.mainContainer_right}>
            <img src="images/image.jpg" alt="" />
          </div>
        </div>
      </div>
    </>
  );
}
