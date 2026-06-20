package com.dyeing.formula.vo;

import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class FormulaDetailVO implements Serializable {

    private Long id;

    private String formulaNo;

    private String formulaName;

    private String fabricType;

    private String colorNo;

    private String colorName;

    private BigDecimal batchSize;

    private Integer version;

    private Long parentId;

    private String status;

    private BigDecimal colorDiffStandard;

    private BigDecimal estimatedCod;

    private Long creatorId;

    private String remark;

    private List<DetailItem> details;

    private List<SampleTestVO> sampleTests;

    private List<ApprovalLogVO> approvalLogs;

    @Data
    public static class DetailItem implements Serializable {
        private Long id;

        private Long auxiliaryId;

        private String auxCode;

        private String auxName;

        private String auxType;

        private Integer forbiddenFlag;

        private BigDecimal dosage;

        private String dosageUnit;

        private BigDecimal dosagePercent;

        private Integer processStep;

        private String processStage;

        private BigDecimal codPerUnit;
    }

    @Data
    public static class SampleTestVO implements Serializable {
        private Long id;

        private String testNo;

        private String sampleBatch;

        private LocalDateTime testDate;

        private String testerName;

        private BigDecimal colorDiffDe;

        private Integer colorPassFlag;

        private String testConclusion;
    }

    @Data
    public static class ApprovalLogVO implements Serializable {
        private Long id;

        private String approvalNode;

        private String approvalNodeName;

        private String operatorName;

        private String operation;

        private LocalDateTime operationTime;

        private String comment;
    }
}
