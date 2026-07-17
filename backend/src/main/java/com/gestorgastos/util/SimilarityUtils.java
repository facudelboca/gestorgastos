package com.gestorgastos.util;

public class SimilarityUtils {

    /**
     * Calcula el índice de similitud de Jaro-Winkler entre dos cadenas.
     * Retorna un valor entre 0.0 (completamente diferentes) y 1.0 (idénticas).
     */
    public static double jaroWinkler(String s1, String s2) {
        if (s1 == null || s2 == null) return 0.0;
        
        s1 = s1.toLowerCase().trim();
        s2 = s2.toLowerCase().trim();

        if (s1.equals(s2)) return 1.0;

        int len1 = s1.length();
        int len2 = s2.length();
        if (len1 == 0 || len2 == 0) return 0.0;

        int matchDistance = Math.max(len1, len2) / 2 - 1;
        boolean[] hash_s1 = new boolean[len1];
        boolean[] hash_s2 = new boolean[len2];

        int matches = 0;
        for (int i = 0; i < len1; i++) {
            for (int j = Math.max(0, i - matchDistance); j < Math.min(len2, i + matchDistance + 1); j++) {
                if (s1.charAt(i) == s2.charAt(j) && !hash_s2[j]) {
                    hash_s1[i] = true;
                    hash_s2[j] = true;
                    matches++;
                    break;
                }
            }
        }

        if (matches == 0) return 0.0;

        double t = 0.0;
        int point = 0;
        for (int i = 0; i < len1; i++) {
            if (hash_s1[i]) {
                while (!hash_s2[point]) point++;
                if (s1.charAt(i) != s2.charAt(point)) t += 0.5;
                point++;
            }
        }

        double j = ((double) matches / len1 + (double) matches / len2 + ((double) matches - t) / matches) / 3.0;

        // Modificación de Winkler
        double p = 0.1; // Factor de escala constante
        int l = 0; // Longitud del prefijo común (máximo 4 caracteres)
        for (int i = 0; i < Math.min(4, Math.min(len1, len2)); i++) {
            if (s1.charAt(i) == s2.charAt(i)) {
                l++;
            } else {
                break;
            }
        }

        return j + l * p * (1 - j);
    }
}
