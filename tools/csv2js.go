package main

import (
	"encoding/csv"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"os"
	"strconv"
	"strings"
)

type Investors struct {
	Investors map[string]int `json:"investor"`
}

func main() {
	if len(os.Args) < 2 {
		log.Fatal("Please point to CSV file")
	}

	f, err := os.Open(os.Args[1])
	if err != nil {
		log.Fatal(err)
	}
	defer f.Close()

	investors, err := collectAddresses(f)
	if err != nil {
		log.Fatal(err)
	}

	if err := writeBatchToFile(*investors, 0); err != nil {
		log.Fatal(err)
	}
}

func collectAddresses(f *os.File) (*map[string]int, error) {
	investors := make(map[string]int)

	var (
		regBal = 0
		refBal = 0
	)

	r := csv.NewReader(f)
	r.Comma = ';'
	r.TrimLeadingSpace = true
	for {
		record, err := r.Read()
		if err == io.EOF {
			break
		}

		if record[4] == "" ||
			strings.Compare(record[4], "EthAddress") == 0 ||
			strings.Compare(record[4], " ") == 0 {

			continue
		}

		if record[7] != "" && record[7] != "0" {
			if regBal, err = strconv.Atoi(record[7]); err != nil {
				return nil, err
			}
		} else {
			regBal = 0
		}

		if record[8] != "" && record[8] != "0" {
			if refBal, err = strconv.Atoi(record[8]); err != nil {
				log.Fatal(err)
			}
		} else {
			refBal = 0
		}

		fmt.Printf("'%s' - '%d'\n", record[4], regBal+refBal)

		investors[record[4]] = regBal + refBal
	}

	return &investors, nil
}

func writeBatchToFile(tmp map[string]int, idx int) error {
	result := Investors{
		Investors: tmp,
	}

	barr, err := json.Marshal(&result)
	if err != nil {
		return err
	}

	cont := "module.exports = " + string(barr) + ";"

	err = ioutil.WriteFile(fmt.Sprintf("investors.%d.js", idx), []byte(cont), 0644)
	if err != nil {
		return err
	}

	return nil
}
