import { ConnectingAirportsOutlined } from "@mui/icons-material"

export const getGitlabOauthUrl = (): string => {
  const gitlabOauthUrl = 'https://gitlab.lnu.se/oauth/authorize'
  const params = {
    client_id: process.env.NEXT_PUBLIC_APPLICATION_ID as string,
    redirect_uri: process.env.NEXT_PUBLIC_CALLBACK_URL as string,
    response_type: 'code',
    scope: [
      'read_api',
      'read_user',
      'profile',
      'email'
    ].join(' '),
  }

  const qs = new URLSearchParams(params)

  return `${gitlabOauthUrl}?${qs.toString()}`
}