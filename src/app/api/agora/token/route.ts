import { NextResponse } from 'next/server';
import { RtcTokenBuilder, RtcRole } from 'agora-token';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { channelName, uid } = body;

    if (!channelName || !uid) {
      return NextResponse.json({ error: 'channelName and uid are required' }, { status: 400 });
    }

    const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;

    if (!appId || !appCertificate) {
      return NextResponse.json({ error: 'Agora credentials are not configured' }, { status: 500 });
    }

    // Role is PUBLISHER since both parties can send/receive audio/video
    const role = RtcRole.PUBLISHER;

    // Token valid for 2 hours
    const expirationTimeInSeconds = 3600 * 2;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    const token = RtcTokenBuilder.buildTokenWithUserAccount(
      appId,
      appCertificate,
      channelName,
      uid, // string type (Supabase UUID)
      role,
      expirationTimeInSeconds, // token expiration time
      privilegeExpiredTs // privilege expiration time
    );

    return NextResponse.json({ token, channelName, uid, appId });
  } catch (error: any) {
    console.error('Error generating Agora token:', error);
    return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 });
  }
}
