function getTag(heading) {
  const tag = {
    name: heading,
    description: heading + " operations"
  }
 
 return tag;
}

module.exports = {
  getTag: getTag
};