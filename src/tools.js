
function changeInfo(s){
    return s == undefined ? '' : s
}

function filter(info){
    const filterInfo = {}
    for(const key in info){
        if(info[key] !== null){
            filterInfo[key] = info[key]
        }
    }
    return filterInfo
}



const filterData = (data, allowedFields) => {
    return Object.keys(data)
        .filter(key => allowedFields.includes(key))
        .reduce((obj, key) => {
        obj[key] = data[key];
        return obj;
        }, {});
};



module.exports = {
    changeInfo,
    filter,
    filterData,
}