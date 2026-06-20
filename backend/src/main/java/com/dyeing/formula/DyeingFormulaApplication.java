package com.dyeing.formula;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.dyeing.formula.mapper")
public class DyeingFormulaApplication {

    public static void main(String[] args) {
        SpringApplication.run(DyeingFormulaApplication.class, args);
    }
}
