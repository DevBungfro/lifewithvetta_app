require("dotenv").config()
const express = require("express")
const app = express()
const path = require("path");
const fetch = require('node-fetch');
const fs = require('fs');
const shirts = require("./shirts.json")
const smtpTransport = require('nodemailer-smtp-transport');

const api_url = "https://lifewithvettaapi.devbungfro.repl.co/"

const bodyParserErrorHandler = require('express-body-parser-error-handler')


const dataDir = path.resolve(`${process.cwd()}${path.sep}views`);

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY


const stripe = require('stripe')(stripeSecretKey)

const nodemailer = require("nodemailer");
var errorhandler = require('errorhandler')

const cookieParser = require('cookie-parser');
app.use(cookieParser());

const compression = require('compression');

app.use(compression());

var bodyParser = require('body-parser')
app.use(express.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));



app.use("/", express.static(path.resolve(`${dataDir}${path.sep}assets`)));
app.set("view engine", "ejs")


app.get("/", (req, res) => {
  fetch(`${api_url}post/page`).then(response => response.json()).then(posts => {
    res.render("home.ejs", {
      posts: posts
    })
  })
})

app.get("/post/:id", (req, res) => {
  fetch(`${api_url}post/get?id=${req.params.id}`).then(response => response.json()).then(post => {
    if (post.post !== null) {
      res.render("post.ejs", { post: post })
    }
  })
})

app.get("/ebook", (req, res) => {

  res.render("ebook.ejs")
})

app.get("/affirmation", (req, res) => {

  res.render("affirmation.ejs")
})

app.get("/monthlyplanner2023", (req, res) => {

  res.render("dailyplanner.ejs")
})

app.get("/postingcenter", (req, res) => {

  res.render("postingcenter.ejs")
})

app.get("/editcenter", (req, res) => {

  res.render("editcenter.ejs")
})

app.get("/login", (req, res) => {

  res.render("login.ejs")
})

app.get("/register", (req, res) => {

  res.render("register.ejs")
})

app.get("/email-verify", async (req, res) => {
  res.send("Email Verified, you may now login.")

  const response = await fetch(`https://lifewithvettaapi.devbungfro.repl.co/account/verify?token=${req.query.token}`, {
    method: 'post',
    headers: { 'Content-Type': 'application/json' }
  });


})

app.post("/register", async (req, res) => {
  const token = generateUUID()
  const link = `https://lifewithvetta.repl.co/email-verify?token=${token}`

  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.user,
      pass: process.env.pass,
    },
  });



  let info = await transporter.sendMail({
    from: "'Life With Vetta', lifewithvetta@gmail.com",
    to: req.body.email,
    subject: "Email Confirmation",
    text: `Hello! This is an automated email from Life With Vetta to confirm that you own this email! Please click this link: ${link} \n to confirm that you own this email, if you didn't signup for our site. Please ignore this email. Thank you!`,
  })

  const response = await fetch(`https://lifewithvettaapi.devbungfro.repl.co/account/create?token=${token}`, {
    method: 'post',
    body: JSON.stringify(req.body),
    headers: { 'Content-Type': 'application/json' }
  });

  const data = await response.json();



})

app.post("/login", async (req, res) => {
  const response = await fetch(`https://lifewithvettaapi.devbungfro.repl.co/account/login?email=${req.body.email}&password=${req.body.password}`, {
    method: 'get',
    headers: { 'Content-Type': 'application/json' }
  });

  const data = await response.json();

})


app.get("/cart", (req, res) => {

  res.render("cart.ejs", { stripePublicKey: stripePublicKey })
})

app.get("/coaching", (req, res) => {

  res.render("coaching.ejs")
})


app.get("/contact", (req, res) => {

  res.render("contact.ejs")
})

app.post("/previewpost", (req, res) => {
  console.log(req.body)
  if (req.body.id == process.env.secret_token) {
    res.render("previewpost.ejs", {
      title3: req.body.title,
      description: req.body.description,
      image: req.body.image,
      date: req.body.date,
    })
  } else {
    res.render("unauthorized.ejs", {
      err: "401",
      title: "Unauthorized",
      description: "You are not authorized to complete this action.",
    })
  }
})


app.get("/blog", (req, res) => {

  fetch(`${api_url}post/page?page=${req.query.page}`).then(response => response.json()).then(posts => {
    let maxpage = Math.floor(posts.totalposts / 5)
    res.render("blog.ejs", {
      page: req.query.page ? parseInt(req.query.page) : 1,
      maxpage: maxpage,
      posts: posts
    })
  })
})

app.get("/about", (req, res) => {

  res.render("about.ejs")
})

app.get("/interface", (req, res) => {

  res.render("interface.ejs")
})

app.get("/shirt/:name", (req, res) => {
  let shirtInfo = shirts[req.params.name]

  if (shirtInfo) {
    res.render("shirts.ejs", { shirt: shirtInfo })
  }
})

app.get("/products", (req, res) => {
  res.render("products.ejs")
})

app.post("/contact", async (req, res) => {
  const email = req.body.email
  console.log(email)

  if (email == null) {
    return
  }

  const transporter = nodemailer.createTransport(smtpTransport({
    host:'mail.lifewithvetta.com',
    secureConnection: false,
    tls: {
      rejectUnauthorized: false
    },
    port: 587,
    auth: {
        user: process.env.user,
        pass: process.env.pass,
  }
}));

  let info = await transporter.sendMail({
    from: "'Life With Vetta', vetta@lifewithvetta.com",
    to: "lifewithvetta@gmail.com",
    subject: "New Contact Entry",
    text: "",
    html: `<div style="background-color:#fff"><div style="margin:0px auto;max-width:600px"><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%"><tbody><tr><td style="direction:ltr;font-size:0px;padding:0;text-align:center"><div style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%"><table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"><tbody><tr><td style="vertical-align:top;padding:0"><table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"><tbody><tr><td style="font-size:0px;padding:0;word-break:break-word"><div style="height:50px;line-height:50px">&hairsp;</div></td></tr></tbody></table></td></tr></tbody></table></div></td></tr></tbody></table></div><div style="background:#ffffff;background-color:#ffffff;margin:0px auto;max-width:600px"><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;background-color:#ffffff;width:100%"><tbody><tr><td style="direction:ltr;font-size:0px;padding:0 20px;text-align:center"><div style="margin:0px auto;max-width:560px"><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%"><tbody><tr><td style="direction:ltr;font-size:0px;padding:11px 6px 15px 6px;text-align:center"><div style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%"><table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"><tbody><tr><td style="vertical-align:top;padding:0"><table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"><tbody><tr><td align="left" style="font-size:0px;padding:0;word-break:break-word"><div style="font-family:HelveticaNeue,Helvetica,Arial,sans-serif;font-size:13px;line-height:1;text-align:left;color:#000000"><span style="color:#2a2a2a;font-size:14px;line-height:19px;letter-spacing:0.5px;font-family:HelveticaNeue-Light,HelveticaNeue,Helvetica,Arial,sans-serif"><strong style="color:#6f6f6f">${req.body.name}</strong> just submitted your form: Contact 2</span></div></td></tr><tr><td align="left" style="font-size:0px;padding:0;padding-top:3px;word-break:break-word"><div style="font-family:HelveticaNeue,Helvetica,Arial,sans-serif;font-size:13px;line-height:1;text-align:left;color:#000000"><span style="font-size:12px;color:#20455e;line-height:18px;letter-spacing:0.3px">on</span> <span style="font-size:12px;color:#20455e;line-height:18px;letter-spacing:0.3px"><a href="http://links.crm.wix.com/ls/click?upn=NF0xrC6l-2FJE4TzUrHsONwq5ciSMLJgIWQpBhcr07XwQCjLLgKq10DxMLQwnsYCjExFNG_eZCo4nN2OgJltWX1sUtbJB1ZNEwi8gZm36oQtYiN6-2Fv0m9IOjQ6enoCzujzoH33EturmPaHlt7m3wYX-2BUBwyftKNvowCSCBtNeT1uGlXIAQNcTyfevlLGwahWQsS9plDO3KtwF2wtvQIQOZxF6zYyJjTJdEy50ipLzCklXmrxNHHmncPDVPIiV1Cu5yREvgufVIIAGzH7o49-2BhUP8H2ufXaq7qQn9G4cjngoA3qUxRE1XKdpiTaPLkk-2FmYJCrXXLaGqTqFpvM83-2F-2F2Y6Niiqe1EvJU33F5L5aBFEDhzEmyQ-2Fv-2FRizZ-2BoPKCKsZU1Z-2FQ4NP2KsohgydmPKPfLKk51T81h9kGhtLs-2B2ttiysjwHNLf-2BA3uXof60gmkcTGK8Pbo46jb-2BQCUGqmBhBGqusankO3L3aT58md3sqoHAFTjqKAOa7p6Y0ooxd9PvaQPCQ3p-2FuW-2Fs4VXt-2FAVuiD3592fsn-2FfpuW6-2FKp-2F6sfv0JJc1UXTlIMQaIZ4ENf7ceUKNYl1Mce1HDAFLRKA1ngWkUI4sZLjIOVemlG1Eyw5ThSP0YwuHsDYl1yhNIWIdOK-2BXcivh3kw0zeFH7Ffm2Q24l0o71Oe2Gi1ISKg8xZNqqGNYEiLHEj7PpYFNxGjSzn63PWw" style="color:#20455e" target="_blank" data-saferedirecturl="https://www.google.com/url?q=http://links.crm.wix.com/ls/click?upn%3DNF0xrC6l-2FJE4TzUrHsONwq5ciSMLJgIWQpBhcr07XwQCjLLgKq10DxMLQwnsYCjExFNG_eZCo4nN2OgJltWX1sUtbJB1ZNEwi8gZm36oQtYiN6-2Fv0m9IOjQ6enoCzujzoH33EturmPaHlt7m3wYX-2BUBwyftKNvowCSCBtNeT1uGlXIAQNcTyfevlLGwahWQsS9plDO3KtwF2wtvQIQOZxF6zYyJjTJdEy50ipLzCklXmrxNHHmncPDVPIiV1Cu5yREvgufVIIAGzH7o49-2BhUP8H2ufXaq7qQn9G4cjngoA3qUxRE1XKdpiTaPLkk-2FmYJCrXXLaGqTqFpvM83-2F-2F2Y6Niiqe1EvJU33F5L5aBFEDhzEmyQ-2Fv-2FRizZ-2BoPKCKsZU1Z-2FQ4NP2KsohgydmPKPfLKk51T81h9kGhtLs-2B2ttiysjwHNLf-2BA3uXof60gmkcTGK8Pbo46jb-2BQCUGqmBhBGqusankO3L3aT58md3sqoHAFTjqKAOa7p6Y0ooxd9PvaQPCQ3p-2FuW-2Fs4VXt-2FAVuiD3592fsn-2FfpuW6-2FKp-2F6sfv0JJc1UXTlIMQaIZ4ENf7ceUKNYl1Mce1HDAFLRKA1ngWkUI4sZLjIOVemlG1Eyw5ThSP0YwuHsDYl1yhNIWIdOK-2BXcivh3kw0zeFH7Ffm2Q24l0o71Oe2Gi1ISKg8xZNqqGNYEiLHEj7PpYFNxGjSzn63PWw&amp;source=gmail&amp;ust=1652546836067000&amp;usg=AOvVaw1Keq256DpefGb6JXzKLOnQ">Life With Vetta</a></span></div></td></tr></tbody></table></td></tr></tbody></table></div></td></tr></tbody></table></div><div style="margin:0px auto;max-width:560px"><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%"><tbody><tr><td style="direction:ltr;font-size:0px;padding:20px 25px 25px 25px;text-align:center"><div style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%"><table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"><tbody><tr><td style="vertical-align:top;padding:0"><table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"><tbody><tr><td align="left" style="font-size:0px;padding:0;word-break:break-word"><div style="font-family:HelveticaNeue,Helvetica,Arial,sans-serif;font-size:13px;line-height:1;text-align:left;color:#000000"><span style="white-space:pre-wrap;font-weight:bold;font-size:16px;line-height:32px;color:#474747">Message Details:</span></div></td></tr><tr><td align="left" style="font-size:0px;padding:0;word-break:break-word"><div style="font-family:HelveticaNeue,Helvetica,Arial,sans-serif;font-size:13px;line-height:1;text-align:left;color:#000000"><span style="white-space:pre-wrap;font-size:16px;line-height:32px;color:#474747">Name:</span> <span style="white-space:pre-wrap;font-family:HelveticaNeue-Light,HelveticaNeue,Helvetica,Arial,sans-serif;font-size:16px;line-height:32px;color:#474747">${req.body.name}</span></div></td></tr><tr><td align="left" style="font-size:0px;padding:0;word-break:break-word"><div style="font-family:HelveticaNeue,Helvetica,Arial,sans-serif;font-size:13px;line-height:1;text-align:left;color:#000000"><span style="white-space:pre-wrap;font-size:16px;line-height:32px;color:#474747">Email:</span> <span style="white-space:pre-wrap;font-family:HelveticaNeue-Light,HelveticaNeue,Helvetica,Arial,sans-serif;font-size:16px;line-height:32px;color:#474747"><a href="mailto:${req.body.email}" style="color:#1f77ff" target="_blank">${req.body.email}</a></span></div></td></tr><tr><td align="left" style="font-size:0px;padding:0;word-break:break-word"><div style="font-family:HelveticaNeue,Helvetica,Arial,sans-serif;font-size:13px;line-height:1;text-align:left;color:#000000"><span style="white-space:pre-wrap;font-size:16px;line-height:32px;color:#474747">Subject:</span> <span style="white-space:pre-wrap;font-family:HelveticaNeue-Light,HelveticaNeue,Helvetica,Arial,sans-serif;font-size:16px;line-height:32px;color:#474747">${req.body.subject}</span></div></td></tr><tr><td align="left" style="font-size:0px;padding:0;word-break:break-word"><div style="font-family:HelveticaNeue,Helvetica,Arial,sans-serif;font-size:13px;line-height:1;text-align:left;color:#000000"><span style="white-space:pre-wrap;font-size:16px;line-height:32px;color:#474747">Message:</span> <span style="white-space:pre-wrap;font-family:HelveticaNeue-Light,HelveticaNeue,Helvetica,Arial,sans-serif;font-size:16px;line-height:32px;color:#474747">${req.body.message}</span></div></td></tr></tbody></table></td></tr></tbody></table></div></td></tr></tbody></table></div> <div style="margin:0px auto;max-width:560px"><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%"><tbody><tr><td style="direction:ltr;font-size:0px;padding:25px 25px 15px 25px;text-align:center"><div style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%"><table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"><tbody><tr><td style="vertical-align:top;padding:0"><table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"><tbody><tr><td align="left" style="font-size:0px;padding:0;word-break:break-word"><div style="font-family:HelveticaNeue,Helvetica,Arial,sans-serif;font-size:13px;line-height:1;text-align:left;color:#000000"><span style="white-space:pre-wrap;display:none;color:#474747;font-size:12px;line-height:19px">Reply to this email directly or via your site's Inbox:</span> <span style="white-space:pre-wrap;display:initial;color:#474747;font-size:12px;line-height:19px">Reply directly or go to your site's Inbox:
</span></div></td></tr></tbody></table></td></tr></tbody></table></div></td></tr></tbody></table></div> <div style="margin:0px auto;max-width:560px"><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%"><tbody><tr><td style="direction:ltr;font-size:0px;padding:0 25px 50px 25px;text-align:center"><div style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%"><table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"><tbody><tr><td style="vertical-align:top;padding:0"><table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"><tbody><tr><td align="left" style="font-size:0px;padding:0;word-break:break-word"><table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:separate;line-height:100%"><tbody><tr><td align="center" bgcolor="#1f77ff" role="presentation" style="border:none;border-radius:24px;background:#1f77ff" valign="middle"><p style="display:inline-block;background:#1f77ff;color:#ffffff;font-family:HelveticaNeue-Light,HelveticaNeue,Helvetica,Arial,sans-serif;font-size:16px;font-weight:normal;line-height:120%;margin:0;text-decoration:none;text-transform:none;padding:10px 25px;border-radius:24px"><a href="https://manage.wix.app/inbox/conversation/4cf493d2-2773-45b7-9869-d5a1d8121b9f?metaSiteId=5f4318ed-8c9f-4946-ab17-143ad8fc3c7b&amp;d=https%3A%2F%2Fwww.wix.com%2Fdashboard%2F5f4318ed-8c9f-4946-ab17-143ad8fc3c7b%2Finbox%2F4cf493d2-2773-45b7-9869-d5a1d8121b9f%3FreferralInfo%3DWIX-FORMS-EMAIL-UOU-REPLY" style="display:inline-block;background:#1f77ff;color:#ffffff;font-family:HelveticaNeue-Light,HelveticaNeue,Helvetica,Arial,sans-serif;font-size:16px;font-weight:normal;margin:0;text-decoration:none;text-transform:none" target="_blank" data-saferedirecturl="https://www.google.com/url?q=https://manage.wix.app/inbox/conversation/4cf493d2-2773-45b7-9869-d5a1d8121b9f?metaSiteId%3D5f4318ed-8c9f-4946-ab17-143ad8fc3c7b%26d%3Dhttps%253A%252F%252Fwww.wix.com%252Fdashboard%252F5f4318ed-8c9f-4946-ab17-143ad8fc3c7b%252Finbox%252F4cf493d2-2773-45b7-9869-d5a1d8121b9f%253FreferralInfo%253DWIX-FORMS-EMAIL-UOU-REPLY&amp;source=gmail&amp;ust=1652546836067000&amp;usg=AOvVaw3JA0R-LQtNsYSNgYTNFeZq">Respond Now</a></p></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></div></td></tr></tbody></table></div> <div style="margin:0px auto;max-width:560px"><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%"><tbody><tr><td style="direction:ltr;font-size:0px;padding:0;text-align:center"><div style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%"><table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"><tbody><tr><td style="vertical-align:top;padding:0"><table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"><tbody><tr><td align="center" style="font-size:0px;padding:0;word-break:break-word"><p style="border-top:solid 1px #bac0c5;font-size:1px;margin:0px auto;width:100%"></p></td></tr></tbody></table></td></tr></tbody></table></div></td></tr></tbody></table></div> <div style="margin:0px auto;max-width:560px"><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%"><tbody><tr><td style="direction:ltr;font-size:0px;padding:0;text-align:center"><div style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%"><table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"><tbody><tr><td style="vertical-align:top;padding:0"><table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"><tbody><tr><td style="font-size:0px;padding:0;word-break:break-word"><div style="height:4px;line-height:4px">&hairsp;</div></td></tr></tbody></table></td></tr></tbody></table></div></td></tr></tbody></table></div><div style="margin:0px auto;max-width:560px"><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%"><tbody><tr><td style="direction:ltr;font-size:0px;padding:0;text-align:center"><div style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%"><table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"><tbody><tr><td style="vertical-align:top;padding:0"><table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"><tbody><tr><td align="left" style="font-size:0px;padding:0;word-break:break-word"><div style="font-family:HelveticaNeue,Helvetica,Arial,sans-serif;font-size:13px;line-height:1;text-align:left;color:#000000"><span style="font-size:10px;line-height:16px;letter-spacing:0.3px;color:#2a2a2a">If you think this submission is spam, <a href="http://links.crm.wix.com/ls/click?upn=NF0xrC6l-2FJE4TzUrHsONwuaRjyhMOwt6ol-2F-2FJXWRq0uxcRElKs5TKuz2a2ZSTkqG96f8Jv-2FQfFgr14u5xbumFh7K2IXD3cvW9hY4CB70xvcHqrYCHGFvMV2FXc8GNrwT21yk_eZCo4nN2OgJltWX1sUtbJB1ZNEwi8gZm36oQtYiN6-2Fv0m9IOjQ6enoCzujzoH33EturmPaHlt7m3wYX-2BUBwyftKNvowCSCBtNeT1uGlXIAQNcTyfevlLGwahWQsS9plDO3KtwF2wtvQIQOZxF6zYyJjTJdEy50ipLzCklXmrxNHHmncPDVPIiV1Cu5yREvgufVIIAGzH7o49-2BhUP8H2ufXaq7qQn9G4cjngoA3qUxRE1XKdpiTaPLkk-2FmYJCrXXLaGqTqFpvM83-2F-2F2Y6Niiqe1EvJU33F5L5aBFEDhzEmyQ-2Fv-2FRizZ-2BoPKCKsZU1Z-2FQ4NP2KsohgydmPKPfLKk51T81h9kGhtLs-2B2ttiysjwHNLf-2BA3uXof60gmkcTGK8Pbo46jb-2BQCUGqmBhBGqusankO3L3aT58md3sqoHAFTjqKAOa7p6Y0ooxd9PvaQPCQ3p-2FuW-2Fs4VXt-2FAVuiD3592fsn-2FfpuW6-2FKp-2F6sfv0JJc1UXTlIMQaIZ4ENf7ceUKNYl1lAR1VJaIgknwxBIfyokGJQ3-2FVU1xPilgIYtB99Lot1Y8gD3ZIKEZ2EtL-2BMweO8vxpB6l8-2FF8g7mpoPt8ZMwTMptMrGrZfcnfYA-2B5qBG80WBy0MbjzatxNtVkGUo9eevt" target="_blank" data-saferedirecturl="https://www.google.com/url?q=http://links.crm.wix.com/ls/click?upn%3DNF0xrC6l-2FJE4TzUrHsONwuaRjyhMOwt6ol-2F-2FJXWRq0uxcRElKs5TKuz2a2ZSTkqG96f8Jv-2FQfFgr14u5xbumFh7K2IXD3cvW9hY4CB70xvcHqrYCHGFvMV2FXc8GNrwT21yk_eZCo4nN2OgJltWX1sUtbJB1ZNEwi8gZm36oQtYiN6-2Fv0m9IOjQ6enoCzujzoH33EturmPaHlt7m3wYX-2BUBwyftKNvowCSCBtNeT1uGlXIAQNcTyfevlLGwahWQsS9plDO3KtwF2wtvQIQOZxF6zYyJjTJdEy50ipLzCklXmrxNHHmncPDVPIiV1Cu5yREvgufVIIAGzH7o49-2BhUP8H2ufXaq7qQn9G4cjngoA3qUxRE1XKdpiTaPLkk-2FmYJCrXXLaGqTqFpvM83-2F-2F2Y6Niiqe1EvJU33F5L5aBFEDhzEmyQ-2Fv-2FRizZ-2BoPKCKsZU1Z-2FQ4NP2KsohgydmPKPfLKk51T81h9kGhtLs-2B2ttiysjwHNLf-2BA3uXof60gmkcTGK8Pbo46jb-2BQCUGqmBhBGqusankO3L3aT58md3sqoHAFTjqKAOa7p6Y0ooxd9PvaQPCQ3p-2FuW-2Fs4VXt-2FAVuiD3592fsn-2FfpuW6-2FKp-2F6sfv0JJc1UXTlIMQaIZ4ENf7ceUKNYl1lAR1VJaIgknwxBIfyokGJQ3-2FVU1xPilgIYtB99Lot1Y8gD3ZIKEZ2EtL-2BMweO8vxpB6l8-2FF8g7mpoPt8ZMwTMptMrGrZfcnfYA-2B5qBG80WBy0MbjzatxNtVkGUo9eevt&amp;source=gmail&amp;ust=1652546836067000&amp;usg=AOvVaw0GslR1u2sRngPPYegQxDsB">report it as spam</a>.</span></div></td></tr></tbody></table></td></tr></tbody></table></div></td></tr></tbody></table></div> <div style="margin:0px auto;max-width:560px"><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%"><tbody><tr><td style="direction:ltr;font-size:0px;padding:0;text-align:center"><div style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%"><table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"><tbody><tr><td style="vertical-align:top;padding:0"><table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"><tbody><tr><td style="font-size:0px;padding:0;word-break:break-word"><div style="height:30px;line-height:30px">&hairsp;</div></td></tr></tbody></table></td></tr></tbody></table></div></td></tr></tbody></table></div><div style="margin:0px auto;max-width:560px"><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%"><tbody><tr><td style="direction:ltr;font-size:0px;padding:0;text-align:center"><div style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%"><table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"><tbody><tr><td style="vertical-align:top;padding:0"><table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"><tbody><tr><td align="left" style="font-size:0px;padding:0;word-break:break-word;display:initial"><div style="font-family:HelveticaNeue,Helvetica,Arial,sans-serif;font-size:13px;line-height:1;text-align:left;color:#000000"><span style="font-size:10px;line-height:16px;color:#8c8c8c;letter-spacing:0.3px">To edit your email settings, go to your Inbox on desktop.</span></div></td></tr></tbody></table></td></tr></tbody></table></div></td></tr></tbody></table></div><div style="margin:0px auto;max-width:560px"><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%"><tbody><tr><td style="direction:ltr;font-size:0px;padding:0;text-align:center"><div style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%"><table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"><tbody><tr><td style="vertical-align:top;padding:0"><table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"><tbody><tr><td style="font-size:0px;padding:0;word-break:break-word;display:none"><div style="height:45px;line-height:45px">&hairsp;</div></td></tr></tbody></table></td></tr></tbody></table></div></td></tr></tbody></table></div></td></tr></tbody></table></div> <div style="margin:0px auto;max-width:600px"><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%"><tbody><tr><td style="direction:ltr;font-size:0px;padding:0;text-align:center"><div style="margin:0px auto;max-width:600px;padding:20px 20px"><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%"><tbody><tr><td style="direction:ltr;font-size:0px;padding:0;text-align:center"><div style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%"><table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"><tbody><tr><td style="vertical-align:top;padding:0"><table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"><tbody><tr><td align="left" style="font-size:0px;padding:0;word-break:break-word"><table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px"><tbody><tr><td style="width:120px"><img height="auto" src="https://ci5.googleusercontent.com/proxy/jMtFJvfLpbhrm869Npty5VGBwH5ELJMPZ6G6Aur_uamw2emPE1FnazN-qHm7PndgK11tiTEPg_nuSeQdbwZH_MznJeIzLyvMj6FS8sqfNUd6bm6TKc6L3EnJPAQhaE4tQLwhCiw=s0-d-e1-ft#https://static.parastorage.com/services/crm-mjml-templates/1.624.0/assets/logo.png" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px" width="120" class="CToWUd"></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></div><div style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%"><table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"><tbody><tr><td style="vertical-align:top;padding:0"><table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"><tbody></tbody></table></td></tr></tbody></table></div><div style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%"><table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"><tbody><tr><td style="vertical-align:top;padding:0"><table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"><tbody></tbody></table></td></tr></tbody></table></div><div style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%"><table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"><tbody><tr><td style="vertical-align:top;padding:0"><table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"><tbody></tbody></table></td></tr></tbody></table></div></td></tr></tbody></table></div></td></tr></tbody></table></div> <div style="margin:0px auto;max-width:600px"><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%"><tbody><tr><td style="direction:ltr;font-size:0px;padding:0;text-align:center"><div style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%"><table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"><tbody><tr><td style="vertical-align:top;padding:0"><table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"><tbody><tr><td style="font-size:0px;padding:0;word-break:break-word"><div style="height:30px;line-height:30px">&hairsp;</div></td></tr></tbody></table></td></tr></tbody></table></div></td></tr></tbody></table></div></div>`

  })

  res.redirect("/")
})

app.get("/merchandise", (req, res) => {

  res.render("merchandise.ejs")
})
app.post("/interface", async (req, res) => {
  const params = new URLSearchParams();
  params.append("title", req.body.title)
  params.append("description", req.body.description)
  params.append("id", req.body.id)
  params.append("image", req.body.image)
  params.append("date", req.body.date)
  params.append("previewText", req.body.previewText)

  const response = await fetch(`https://lifewithvettaapi.devbungfro.repl.co/post/create`, {
    method: 'post',
    body: params,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });

  res.json(await response.json())
})

app.post("/interface/edit", async (req, res) => {
  const response = await fetch('https://lifewithvettaapi.devbungfro.repl.co/post/edit', {
    method: 'post',
    body: JSON.stringify(req.body),
    headers: { 'Content-Type': 'application/json' }
  });

  const data = await response.json();

})

app.post("/interface/delete", async (req, res) => {
  const response = await fetch('https://lifewithvettaapi.devbungfro.repl.co/post/delete', {
    method: 'post',
    body: JSON.stringify(req.body),
    headers: { 'Content-Type': 'application/json' }
  });

  const data = await response.json();

})

app.post('/purchase', async (req, res) => {
  if (req.query) {
    if (req.query == null || req.query.length == 0) return;
    let id
    let shipping = {
      shipping_rate_data: {
        type: 'fixed_amount',
        fixed_amount: {
          amount: 499,
          currency: 'usd',
        },
        display_name: 'Shipping',
        delivery_estimate: {
          minimum: {
            unit: 'business_day',
            value: 5,
          },
          maximum: {
            unit: 'business_day',
            value: 7,
          },
        }
      }
    }
    let hasShirt

          let items = []
          if (typeof req.query.name == "string") {
            req.query = { name: [req.query.name], price: [req.query.price], quantity: [req.query.quantity] }
          }
          for (let index = 0; index < req.query.name.length; index++) {
            items[index] = index

            if (req.query.name[index] !== "eBook" && req.query.name[index] !== "Affirmation" && req.query.name[index] !== "Monthly Planner 2023") {
              hasShirt = true
            }
          }



          const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            allow_promotion_codes: true,
            metadata: {
              order_id: "0",
            },
            shipping_address_collection: {
              allowed_countries: ['US', 'CA'],
            },
            shipping_options: [
              hasShirt == true ? shipping : {}
            ],
            line_items: items.map(index => {
              console.log(req.query.price[index])
              return {
                price_data: {
                  currency: "usd",
                  product_data: {
                    name: req.query.name[index],
                  },
                  unit_amount: (parseFloat(req.query.price[index]) * 100),
                },
                quantity: parseInt(req.query.quantity[index]),
              }
            }),
            success_url: `https://lifewithvetta.com/purchase-completed`,
            cancel_url: `https://lifewithvetta.com/cart`,
          })
          res.cookie('stripe_id', session.id, { expires: new Date(Date.now() + 900000), httpOnly: true })
          res.json({ url: session.url })

      } else {
        return
      }


})

app.get("/purchase-completed", async (req, res) => {
  if (req.headers.referer == "https://checkout.stripe.com/" && req.cookies.stripe_id != null) {
    const session = await stripe.checkout.sessions.retrieve(
      req.cookies.stripe_id
    );
    const customer = await stripe.customers.retrieve(
      session.customer
    );
    stripe.checkout.sessions.listLineItems(
      req.cookies.stripe_id,
      { limit: 100 },
      function(err, lineItems) {
        let hasEbook
        let hasPlanner
        let hasAffirmation
        let hasShirts
        lineItems.data.forEach(item => {
          if (item.description == "eBook" || item.description == "Affirmation" || item.description == "Monthly Planner 2023") {
            if (item.description == "eBook") {
              hasEbook = true
            }
            if (item.description == "Affirmation") {
              hasAffirmation = true
            }
            if (item.description == "Monthly Planner 2023") {
              hasPlanner = true
            }
          } else {
            hasShirts = true
          }
        })
        if (hasEbook == true) {
          sendMail(customer, "0", lineItems, session)
        }

        if (hasAffirmation == true) {
          sendAffirmation(customer, session)
        }

        if (hasPlanner == true) {
          sendPlanner(customer)
        }

        res.redirect("/")
      }
    );

  }

})



async function sendMail(customer, order_id, items, session) {
  const email = customer.email
  const date = new Date(Date.now());
  const [month, day, year] = [date.getMonth(), date.getDate(), date.getFullYear()];

  const params = new URLSearchParams();
  params.append("id", process.env.secret_token)

const transporter = nodemailer.createTransport(smtpTransport({
    host:'mail.lifewithvetta.com',
    secureConnection: false,
    tls: {
      rejectUnauthorized: false
    },
    port: 587,
    auth: {
        user: process.env.user,
        pass: process.env.pass,
  }
}));

const mailOptions = {
    from:'Vetta <vetta@lifewithvetta.com>',
    to: email,
    subject:"Ebook Download",
    html: "Hello, thank you for your purchase. Open the pdf below to start reading. You are well on your way to seeing the world, one country at a time.",
    attachments: [
      
    {   // file on disk as an attachment
        filename: 'purchase.pdf',
        path: "https://cdn.lifewithvetta.com/purchase.pdf" // stream this file
    },
    ]
}
//3) Actually send the email
transporter.sendMail(mailOptions);

}

async function sendAffirmation(customer, session) {
   const email = customer.email

  const transporter = nodemailer.createTransport(smtpTransport({
    host:'mail.lifewithvetta.com',
    secureConnection: false,
    tls: {
      rejectUnauthorized: false
    },
    port: 587,
    auth: {
        user: process.env.user,
        pass: process.env.pass,
  }
}));
  
const mailOptions = {
    from:'Vetta <vetta@lifewithvetta.com>',
    to: email,
    subject:"Affirmation Download",
    html: "Hello, thank you for your purchase. Open the pdf below to print and cutout your affirmation cards. Positive affirmations are simple, powerful statements that can help you reframe your thoughts and transform your life. By repeating these affirmations to yourself on a daily basis, you can train your brain to believe in your own worth and capability.",
    attachments: [
      
    {   // file on disk as an attachment
        filename: 'purchase.pdf',
        path: "https://cdn.lifewithvetta.com/purchase_affirmation.pdf" // stream this file
    },
    ]
}
//3) Actually send the email
transporter.sendMail(mailOptions);

}

async function sendPlanner(customer, session) {
   const email = customer.email

  const transporter = nodemailer.createTransport(smtpTransport({
    host:'mail.lifewithvetta.com',
    secureConnection: false,
    tls: {
      rejectUnauthorized: false
    },
    port: 587,
    auth: {
        user: process.env.user,
        pass: process.env.pass,
  }
}));

const mailOptions = {
    from:'Vetta <vetta@lifewithvetta.com>',
    to: email,
    subject:"Planner Download",
    html: "Hello, thank you for your purchase. You did it! You are well on your way to start living your most organized and productive life.",
    attachments: [
      
    {   // file on disk as an attachment
        filename: 'purchase.pdf',
        path: "https://cdn.lifewithvetta.com/purchase_planner.pdf" // stream this file
    },
    ]
}
//3) Actually send the email
transporter.sendMail(mailOptions);

}

function generateUUID() {
  var d = new Date().getTime();


  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });

  return uuid;
}

app.listen(3000)
