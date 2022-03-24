import React from 'react'
import { withIronSessionSsr } from "iron-session/next"
import { getGitlabOauthTokens } from '../intergrations/gitlab-oauth-tokens'
import { IRON_SESSION_CONFIG } from '../config/iron-session-config'
import { getGitlabUserInfo, GitlabUserInfo } from '../intergrations/gitlab-user-info'
import Error from 'next/error'
import { GetServerSidePropsResult } from 'next'
import ProfileCard from '../components/ProfileCard'
import { Box } from '@mui/material'
import { getGitlabOauthUrl } from '../utils/gitlab-oauth-url'
import ProfileTabs from '../components/ProfileTabs'
import { isExpiredAccessToken, updateTokens } from '../utils/tokens-expiration-checker'


const Profile = ({ userInfo, error }: any) => {
  if (error?.code) {
    return <Error statusCode={error.code} title={error.message} />
  }

  return (
    <>
      <ProfileTabs />
      <Box sx={{ m: 'auto', width: '100%', minHeight: '100vh', display: 'flex' }}>
        <ProfileCard userInfo={userInfo} />
      </Box></>

  )
}

export const getServerSideProps = withIronSessionSsr(
  async function getServerSideProps ({ req, query }: any): Promise<GetServerSidePropsResult<{
    userInfo: GitlabUserInfo | null,
    error: { code: number, message: string } | null
  }>> {
    try {

      if (req.session?.tokens && isExpiredAccessToken(req.session.tokens)) {
        await updateTokens(req)
      }

      if (query.code) {
        const code = query.code
        const tokens = await getGitlabOauthTokens(code)
        req.session.tokens = tokens

        await req.session.save()
        return {
          redirect: {
            destination: '/profile',
            permanent: false,
          },
        }
      } else if (!req.session.tokens) {
        return {
          redirect: {
            destination: getGitlabOauthUrl(),
            permanent: false,
          },
        }
      }

      const userInfo: GitlabUserInfo = await getGitlabUserInfo(req.session.tokens.accessToken)

      req.session.userInfo = userInfo
      await req.session.save()

      return {
        props: {
          userInfo,
          error: null
        }
      }
    } catch (error: any) {
      return {
        props: {
          userInfo: null,
          error: {
            code: 401,
            message: error.message
          }
        }
      }
    }

  },
  IRON_SESSION_CONFIG
)

export default Profile