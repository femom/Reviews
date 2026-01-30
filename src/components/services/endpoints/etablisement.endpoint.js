import api from "../api.js"

export const getEtablisement =()=>{
    return api.get("/api/groupe-8/etablissements")
}