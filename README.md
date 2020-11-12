# reliable-notifier

Cansado do "Avise-me" de um certo site de hardware que nunca funciona.

Scraper que roda em um certo intervalo, verifica se o item esta disponivel e manda sms pro seu numero.

Exemplo de uso
```
$> TWILIO_ACCOUNT_SID="<twilio-sid>" \
TWILIO_AUTH_TOKEN="<twilio-auth-token>" \
TWILIO_FROM_NUMBER="<form-number>" \
TO_NUMBER="<to-number>" \
INTERVAL=<interval to repeat the check default 60000> \
ROOTURL="<root url of the target>" \
SUBRESOURCE="<sub resource>" \
QUERY="query string" \
SELECTOR="result seletor" \
PRICESELECTOR="price selector" \
LINKSELECTOR="link selector" \
node index.js
```
