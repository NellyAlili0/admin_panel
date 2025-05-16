// Notify with onesignal
export class Notify {
  base_url: string
  constructor() {
    this.base_url = 'https://api.onesignal.com/notifications?c=push'
  }
  async sendSingle({ title, message, email }: { title: string, message: string, email: string | null }) {
    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        Authorization: 'Key ' + process.env.ONESIGNAL_KEY!,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        app_id: process.env.ONESIGNAL_APP_ID!,
        target_channel: "push",
        contents: { en: message },
        headings: { en: title },
        include_aliases: {
          external_id: [email]
        },
      })
    };

    await fetch(this.base_url, options)
    return true;
  }
  async sendBulk({ title, message, segment, big_picture }: { title: string, message: string, segment: string, big_picture: string }) {
    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        Authorization: 'Key ' + process.env.ONESIGNAL_KEY!,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        app_id: process.env.ONESIGNAL_APP_ID!,
        contents: { en: message },
        headings: { en: title },
        big_picture: big_picture,
        included_segments: [segment]
      })
    };
    await fetch(this.base_url, options)
    return true;
  }
}