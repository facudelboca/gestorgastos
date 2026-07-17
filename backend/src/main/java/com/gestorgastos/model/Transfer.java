package com.gestorgastos.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "transfers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transfer extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @NotNull(message = "El usuario asociado es requerido")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_account_id", nullable = false)
    @NotNull(message = "La cuenta origen es requerida")
    private Account sourceAccount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destination_account_id", nullable = false)
    @NotNull(message = "La cuenta destino es requerida")
    private Account destinationAccount;

    @NotNull(message = "El monto de la transferencia es requerido")
    @Positive(message = "El monto a transferir debe ser mayor a cero")
    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal amount;

    @Size(max = 255, message = "La descripción no puede superar los 255 caracteres")
    @Column(length = 255)
    private String description;

    @Column(name = "transfer_date", nullable = false)
    @Builder.Default
    private OffsetDateTime transferDate = OffsetDateTime.now();
}
