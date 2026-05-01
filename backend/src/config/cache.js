import NodeCache from "node-cache";

//cache tồn tại trong 24h và kiểm tra lại mỗi 10p (600s)
const cache = new NodeCache({ stdTTL: 86400, checkperiod: 600 });
export default cache;
