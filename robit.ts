//% color=#0fbc11 weight=10 icon="\uf013"
namespace robit {

    let line_follow_Left_Pin = DigitalPin.P3
    let line_follow_Right_Pin = DigitalPin.P4

    const PCA9685_ADDRESS = 0x40

    const MODE1 = 0x00
    const MODE2 = 0x01

    const SUBADR1 = 0x02
    const SUBADR2 = 0x03
    const SUBADR3 = 0x04
    const PRESCALE = 0xFE

    const LED0_ON_L = 0x06
    const LED0_ON_H = 0x07
    const LED0_OFF_L = 0x08
    const LED0_OFF_H = 0x09

    const ALL_LED_ON_L = 0xFA
    const ALL_LED_ON_H = 0xFB
    const ALL_LED_OFF_L = 0xFC
    const ALL_LED_OFF_H = 0xFD


    const STP_CHA_L = 2047
    const STP_CHA_H = 4095

    const STP_CHB_L = 1
    const STP_CHB_H = 2047

    const STP_CHC_L = 1023
    const STP_CHC_H = 3071

    const STP_CHD_L = 3071
    const STP_CHD_H = 1023

    export enum Servos {
        S1 = 0x01,
        S2 = 0x02,
        S3 = 0x03,
        S4 = 0x04,
        S5 = 0x05,
        S6 = 0x06,
        S7 = 0x07,
        S8 = 0x08
    }

    export enum Motors {
        //% block="M1"
        M1 = 0x1,
        //% block="M2"
        M2 = 0x2,
        //% block="M3"
        M3 = 0x3,
        //% block="M4"
        M4 = 0x4
    }

    export enum Steppers {
        STEP1 = 0x1,
        STEP2 = 0x2
    }

    export enum Jpin {
        //% block="J3 (P1,P2)"
        J3 = 3,
        //% block="J1 (P13,P14)"
        J1 = 1,
        //% block="J2 (P15,P16)"
        J2 = 2,
        //% block="J4 (P3,P4)"
        J4 = 4
    }

    export enum Turns {
        //% blockId="T1B4" block="1/4"
        T1B4 = 90,
        //% blockId="T1B2" block="1/2"
        T1B2 = 180,
        //% blockId="T1B0" block="1"
        T1B0 = 360,
        //% blockId="T2B0" block="2"
        T2B0 = 720,
        //% blockId="T3B0" block="3"
        T3B0 = 1080,
        //% blockId="T4B0" block="4"
        T4B0 = 1440,
        //% blockId="T5B0" block="5"
        T5B0 = 1800
    }

    let initialized = false
    //    let initializedMatrix = false

    let matBuf = pins.createBuffer(17);

    
    function i2cwrite(addr: number, reg: number, value: number) {
        let buf = pins.createBuffer(2)
        buf[0] = reg
        buf[1] = value
        pins.i2cWriteBuffer(addr, buf)
    }


    
    function i2ccmd(addr: number, value: number) {
        let buf = pins.createBuffer(1)
        buf[0] = value
        pins.i2cWriteBuffer(addr, buf)
    }


    
    function i2cread(addr: number, reg: number) {
        pins.i2cWriteNumber(addr, reg, NumberFormat.UInt8BE)
        let val = pins.i2cReadNumber(addr, NumberFormat.UInt8BE)
        return val
    }


    
    function initPCA9685(): void {
        i2cwrite(PCA9685_ADDRESS, MODE1, 0x00)
        setFreq(50); //1s / 20ms
        for (let idx = 0; idx < 16; idx++) {
            setPwm(idx, 0, 0);
        }
        initialized = true
    }


    
    function setFreq(freq: number): void {
        // Constrain the frequency
        let prescaleval = 25000000
        prescaleval /= 4096
        prescaleval /= freq
        prescaleval = prescaleval * 25 / 24  // 0.915
        prescaleval -= 1
        let prescale = prescaleval //Math.Floor(prescaleval + 0.5);
        let oldmode = i2cread(PCA9685_ADDRESS, MODE1)
        let newmode = (oldmode & 0x7F) | 0x10 // sleep
        i2cwrite(PCA9685_ADDRESS, MODE1, newmode) // go to sleep
        i2cwrite(PCA9685_ADDRESS, PRESCALE, prescale) // set the prescaler
        i2cwrite(PCA9685_ADDRESS, MODE1, oldmode)
        basic.pause(1)
        //control.waitMicros(5000);
        i2cwrite(PCA9685_ADDRESS, MODE1, oldmode | 0xa1)  //1010 0001
    }


    
    function setPwm(channel: number, on: number, off: number): void {
        if (channel < 0 || channel > 15)
            return;

        let buf = pins.createBuffer(5)
        buf[0] = LED0_ON_L + 4 * channel
        buf[1] = on & 0xff
        buf[2] = (on >> 8) & 0xff
        buf[3] = off & 0xff
        buf[4] = (off >> 8) & 0xff
        pins.i2cWriteBuffer(PCA9685_ADDRESS, buf)
    }



    
    function setStepper(index: number, dir: boolean): void {
        if (index == 1) {
            if (dir) {
                setPwm(0, STP_CHA_L, STP_CHA_H)
                setPwm(2, STP_CHB_L, STP_CHB_H)
                setPwm(1, STP_CHC_L, STP_CHC_H)
                setPwm(3, STP_CHD_L, STP_CHD_H)
            } else {
                setPwm(3, STP_CHA_L, STP_CHA_H)
                setPwm(1, STP_CHB_L, STP_CHB_H)
                setPwm(2, STP_CHC_L, STP_CHC_H)
                setPwm(0, STP_CHD_L, STP_CHD_H)
            }
        }
        else {
            if (dir) {
                setPwm(4, STP_CHA_L, STP_CHA_H)
                setPwm(6, STP_CHB_L, STP_CHB_H)
                setPwm(5, STP_CHC_L, STP_CHC_H)
                setPwm(7, STP_CHD_L, STP_CHD_H)
            } else {
                setPwm(7, STP_CHA_L, STP_CHA_H)
                setPwm(5, STP_CHB_L, STP_CHB_H)
                setPwm(6, STP_CHC_L, STP_CHC_H)
                setPwm(4, STP_CHD_L, STP_CHD_H)
            }
        }
    }


    
    function stopMotor(index: number) {
        setPwm((index - 1) * 2, 0, 0)
        setPwm((index - 1) * 2 + 1, 0, 0)
    }


    //////////////////////////////////////////////////////////////////////////////////////////////////////////


    /**
	 * Servo Execute
	 * @param index Servo Channel; eg: S1
	 * @param degree [0-180] degree of servo; eg: 0, 90, 180
	*/
    //% blockId=robit_servo block="Servo|%index|degree %degree"
    //% weight=100
    //% advanced=true
    //% blockGap=50
    //% degree.min=0 degree.max=180
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=4
    export function Servo(index: Servos, degree: number): void {
        if (!initialized) {
            initPCA9685()
        }
        // 50hz: 20,000 us
        let v_us = (degree * 1800 / 180 + 600) // 0.6 ~ 2.4
        let value = v_us * 4096 / 20000
        setPwm(index + 7, 0, value)
    }


    //步进电机旋转度数
    //% blockId=robit_stepper_degree block="Stepper 28BYJ-48|%index|degree %degree"
    //% weight=90
    //% advanced=true
    export function StepperDegree(index: Steppers, degree: number): void {
        if (!initialized) {
            initPCA9685()
        }
        setStepper(index, degree > 0)
        degree = Math.abs(degree)
        basic.pause(10240 * degree / 360)
        MotorStopAll()
    }



    //步进电机圈数
    //% blockId=robit_stepper_turn block="Stepper 28BYJ-48|%index|turn %turn"
    //% weight=90
    //% advanced=true
    export function StepperTurn(index: Steppers, turn: Turns): void {
        let degree = turn
        StepperDegree(index, degree)
    }


    //单个电机速度
    //% blockId=robit_motor_run block="%index |Wheel|speed %speed "
    //% weight=85
    //% speed.min=-100 speed.max=100
    //% advanced=true
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=4
    export function MotorRun(index: Motors, speed: number): void {
        if (!initialized) {
            initPCA9685()
        }
        speed = speed * 40; // map 100 to 4096
        if (speed >= 4096) {
            speed = 4095
        }
        if (speed <= -4096) {
            speed = -4095
        }
        if (index > 4 || index <= 0)
            return
        let pp = (index - 1) * 2
        let pn = (index - 1) * 2 + 1
        if (speed >= 0) {
            setPwm(pp, 0, speed)
            setPwm(pn, 0, 0)
        } else {
            setPwm(pp, 0, 0)
            setPwm(pn, 0, -speed)
        }
    }


    /**
	 * Execute two motors at the same time
     * @param motor_left describe parameter here, eg: 1
	 * @param speed1 [-100-100] speed of motor; eg: 50
	 * @param motor_right describe parameter here, eg: 2
	 * @param speed2 [-100-100] speed of motor; eg: 50
	*/
    //% blockId=robit_motor_dual block="Left wheel %motor1|speed %speed1|Right wheel %motor2|speed %speed2"
    //% weight=84
    //% speed1.min=-100 speed1.max=100
    //% speed2.min=-100 speed2.max=100
  
    export function MotorRunDual(motor_left: Motors, speed1: number, motor_right: Motors, speed2: number): void {
        speed1 = -speed1

        MotorRun(motor_left, speed1 / 2 * 5);   //100 map to 255
        MotorRun(motor_right, speed2 / 2 * 5);
    }


    
    //% blockId=robit_stop block="Motor Stop|%index|"
    //% weight=80
    export function MotorStop(index: Motors): void {
        MotorRun(index, 0);
    }


    
    //% blockId=robit_stop_all block="Motor Stop All"
    //% weight=79
    //% blockGap=50
    export function MotorStopAll(): void {
        for (let idx = 1; idx <= 4; idx++) {
            stopMotor(idx);
        }
    }



    
    /**
	 * get Ultrasonic
	 * @param jpin, eg: 3
	*/
    //% blockId=robit_ultrasonic block="Ultrasonic|pin %pin"
    //% weight=10
    export function Ultrasonic(jpin: Jpin): number {
        let pin = DigitalPin.P2
        switch (jpin) {
            case 1: pin = DigitalPin.P14
                break;
            case 2: pin = DigitalPin.P16
                break;
            case 3: pin = DigitalPin.P2
                break;
            case 4: pin = DigitalPin.P4
                break;
        }

        // send pulse
        pins.setPull(pin, PinPullMode.PullNone);
        pins.digitalWritePin(pin, 0);
        control.waitMicros(2);
        pins.digitalWritePin(pin, 1);
        control.waitMicros(10);
        pins.digitalWritePin(pin, 0);

        // read pulse
        let d = pins.pulseIn(pin, PulseValue.High, 23000);  // 8 / 340 = 
        return d * 5 / 3 / 58;
    }




    
    /**
	 * init line follow
	 * @param jpin; eg: 1
	*/
    //% blockId=robit_init_line_follow block="init line follow|pin %jpin"
    //% weight=10
    export function init_line_follow(jpin: Jpin): void {
        switch (jpin) {
            case 1:
                line_follow_Left_Pin = DigitalPin.P13
                line_follow_Right_Pin = DigitalPin.P14
                break;
            case 2:
                line_follow_Left_Pin = DigitalPin.P15
                line_follow_Right_Pin = DigitalPin.P16
                break;
            case 3:
                line_follow_Left_Pin = DigitalPin.P1
                line_follow_Right_Pin = DigitalPin.P2
                break;
            case 4:
                line_follow_Left_Pin = DigitalPin.P3
                line_follow_Right_Pin = DigitalPin.P4
                break;
        }
    }


    /**
	 * line follow left
	*/
    //% blockId=robit_left_line_follow block="left line follow digitalpin"
    //% weight=10
    export function left_line_follow(): number {
        let i = 0
        if (pins.digitalReadPin(line_follow_Left_Pin) == 1) {
            i = 1
        } else i = 0
        return i
    }


    /**
	 * right follow right
	*/
    //% blockId=robit_right_line_follow block="right line follow digitalpin"
    //% weight=10
    export function right_line_follow(): number {
        let i = 0
        if (pins.digitalReadPin(line_follow_Right_Pin) == 1) {
            i = 1
        } else i = 0
        return i
    }


}

