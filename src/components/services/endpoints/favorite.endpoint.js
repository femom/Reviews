import api from "../api";


export const addFavorites = (data)=>{
    return api.post("/api/groupe-8/favorites",data)
}