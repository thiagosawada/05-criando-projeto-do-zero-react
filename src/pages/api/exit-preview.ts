import url from 'url';

export default async function exit(req, res): Promise<void> {
  res.clearPreviewData();

  const queryObject = url.parse(req.url, true).query;
  const redirectUrl =
    queryObject && queryObject.currentUrl ? queryObject.currentUrl : '/';

  res.writeHead(307, { Location: redirectUrl });
  res.end();
}
