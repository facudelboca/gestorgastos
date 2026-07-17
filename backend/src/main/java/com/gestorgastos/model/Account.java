package com.gestorgastos.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "accounts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Account extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @NotNull(message = "El usuario asociado es requerido")
    private User user;

    @NotBlank(message = "El nombre de la cuenta no puede estar vacío")
    @Size(max = 100, message = "El nombre de la cuenta no puede superar los 100 caracteres")
    @Column(nullable = false, length = 100)
    private String name;

    @NotNull(message = "El saldo inicial es requerido")
    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal balance;

    @NotBlank(message = "El código de moneda es requerido")
    @Size(min = 3, max = 3, message = "El código de moneda debe tener exactamente 3 caracteres")
    @Column(nullable = false, length = 3)
    private String currency;
}
