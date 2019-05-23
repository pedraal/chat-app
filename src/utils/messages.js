const generateMessage = (username, text) => {
  return {
    username,
    text,
    createdAt: new Date().getTime()
  }
}

const generateLocMessage = (username, coords) => {
  return {
    username,
    url: `https://google.com/maps?q=${coords.lat},${coords.long}`,
    createdAt: new Date().getTime()
  }
}

module.exports = {
  generateMessage,
  generateLocMessage
}
