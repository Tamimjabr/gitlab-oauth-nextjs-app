import { Button } from '@mui/material'
import type { GetServerSidePropsResult, NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { IRON_SESSION_CONFIG } from '../config/iron-session-config'
import { GitlabUserInfo } from '../intergrations/gitlab-user-info'
import styles from '../styles/Home.module.css'
import { getGitlabOauthUrl } from '../utils/gitlab-oauth-url'
import { withIronSessionSsr } from "iron-session/next"
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import {  getCsrfTokenAndSaveOnSession } from '../utils/csrf-token-handler'

const Home = ({ userInfo, state }: { userInfo: GitlabUserInfo | null, state: string | null }) => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Home</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title + ' animate__animated animate__backInDown'}>
          Welcome to <a href="https://nextjs.org">Next.js</a> and <a href="https://about.gitlab.com/">Gitlab</a> OAuth Integration
        </h1>
        {userInfo ? (
          <Link href='/profile' passHref>
            <Button variant="contained" size="large" sx={{ m: '1rem' }}>
              Visit Your Profile < AccountCircleRoundedIcon sx={{ marginLeft: '0.2rem' }} />
            </Button>
          </Link>
        ) : state && (
          <Link href={getGitlabOauthUrl(state)} passHref>
            <Button variant="contained" size="large" sx={{ m: '1rem' }}>
              Login Here
            </Button>
          </Link>
        )
        }

      </main >
      <footer className={styles.footer}>
        <a
          href="https://tamim-cv.netlify.app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by Tamim Jabr
        </a>
      </footer>
    </div >
  )
}

export const getServerSideProps = withIronSessionSsr(
  async function getServerSideProps ({ req }: any): Promise<GetServerSidePropsResult<{
    userInfo: GitlabUserInfo | null,
    state: string | null
  }>> {

    if (req.session?.userInfo) {
      return {
        props: {
          userInfo: req.session?.userInfo,
          state: null
        }
      }
    }
    // generate one time token for gitlab oauth url to check when the user redirected back
    const state = await getCsrfTokenAndSaveOnSession(req)

    return {
      props: {
        userInfo: null,
        state: state
      }
    }
  },
  IRON_SESSION_CONFIG
)

export default Home
