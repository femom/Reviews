import api from "../api";

export const creacteReview = (data)=>{
    return api.post("api/groupe-8/etablissements/1/avis",data)
}

export const getReviewByEts = (
)=>{
    return api.get("api/groupe-8/etablissements/1/avis")
} 
