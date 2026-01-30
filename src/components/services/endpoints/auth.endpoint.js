import api from "../../services/api.js"

export const connexion = (data)=>{
    return api.post("/api/groupe-8/auth/login",data)
}

export const inscrire = (data)=>{
    return api.post("/api/groupe-8/auth/register",data)
} 