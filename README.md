# api.ppqr.app

A service that generates PromptPay QR codes.

## API

| URL | Description |
| --- | --- |
| <https://api.ppqr.app/0900000000> | No amount specified |
| <https://api.ppqr.app/0900000000/422> | With fixed amount |
| <https://api.ppqr.app/0900000000?name=My+Name> | With account name |
| <https://api.ppqr.app/0900000000/422?name=My+Name> | With fixed amount and account name |

## Differences from [promptpay.io](https://promptpay.io/)

- The generated QR code has a generous amount of padding, making it [suitable for sending via Facebook Messenger](https://user-images.githubusercontent.com/193136/155515054-8313aca6-528f-4084-8d1b-3681b599a1ae.png).
- Text can be added to indicate the name of the recipient.
